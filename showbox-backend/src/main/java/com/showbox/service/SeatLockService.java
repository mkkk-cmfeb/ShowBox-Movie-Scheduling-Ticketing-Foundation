package com.showbox.service;

import com.showbox.model.ShowSeat;
import com.showbox.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SeatLockService {

    @Autowired
    private ShowSeatRepository showSeatRepository;

    // 1. Lock a seat for 5 minutes
    @Transactional
    public boolean lockSeat(Long showId, String seatNumber, String userEmail) {
        Optional<ShowSeat> seatOpt = showSeatRepository.findByShowScheduleIdAndSeatNumber(showId, seatNumber);
        ShowSeat seat;

        if (seatOpt.isPresent()) {
            seat = seatOpt.get();
            // If it is already locked by someone else and the lock hasn't expired yet, reject the request
            if (!"AVAILABLE".equals(seat.getStatus()) && 
                seat.getLockedUntil() != null && 
                seat.getLockedUntil().isAfter(LocalDateTime.now()) && 
                !userEmail.equals(seat.getLockedBy())) {
                return false; 
            }
        } else {
            // First time this seat is being clicked, create it in the database
            seat = new ShowSeat();
            seat.setShowScheduleId(showId);
            seat.setSeatNumber(seatNumber);
        }

        // Apply the lock
        seat.setStatus("LOCKED");
        seat.setLockedBy(userEmail);
        seat.setLockedUntil(LocalDateTime.now().plusMinutes(5));
        showSeatRepository.save(seat);
        return true;
    }

    // 2. Unlock a seat (if the user manually deselects it)
    @Transactional
    public void unlockSeat(Long showId, String seatNumber, String userEmail) {
        Optional<ShowSeat> seatOpt = showSeatRepository.findByShowScheduleIdAndSeatNumber(showId, seatNumber);
        if (seatOpt.isPresent()) {
            ShowSeat seat = seatOpt.get();
            // Only the user who locked it can unlock it
            if (userEmail.equals(seat.getLockedBy()) && "LOCKED".equals(seat.getStatus())) {
                seat.setStatus("AVAILABLE");
                seat.setLockedBy(null);
                seat.setLockedUntil(null);
                showSeatRepository.save(seat);
            }
        }
    }

    // 3. Background Job: Auto-Release expired seats every 60 seconds
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredLocks() {
        List<ShowSeat> allSeats = showSeatRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (ShowSeat seat : allSeats) {
            if ("LOCKED".equals(seat.getStatus()) && seat.getLockedUntil() != null && seat.getLockedUntil().isBefore(now)) {
                seat.setStatus("AVAILABLE");
                seat.setLockedBy(null);
                seat.setLockedUntil(null);
                showSeatRepository.save(seat);
                System.out.println("System automatically released expired lock for seat: " + seat.getSeatNumber());
            }
        }
    }
}