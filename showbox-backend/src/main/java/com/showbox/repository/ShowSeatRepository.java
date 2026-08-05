package com.showbox.repository;

import com.showbox.model.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {
    
    // Find a specific seat for a specific show (used when a user clicks a seat)
    Optional<ShowSeat> findByShowScheduleIdAndSeatNumber(Long showScheduleId, String seatNumber);
    
    // Find all seats for a specific show (used to render the seat map colors)
    List<ShowSeat> findByShowScheduleId(Long showScheduleId);
    
    // Find all locked seats that belong to a specific user
    List<ShowSeat> findByShowScheduleIdAndLockedBy(Long showScheduleId, String lockedBy);
}