package com.showbox.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.showbox.model.Booking;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // User ki bookings nikalne ke liye (Latest pehle aayegi)
    List<Booking> findByUserEmailOrderByBookingTimeDesc(String userEmail);
    
    // Show ki booked seats (Seat blocking) nikalne ke liye
    List<Booking> findByShowId(Long showId);
}