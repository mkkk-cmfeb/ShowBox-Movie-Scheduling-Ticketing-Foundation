package com.showbox.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long showId;
    private String userEmail;
    private String seatNumbers;
    private int totalAmount;
    
    // Booking kab hui thi, uski entry apne aap ho jayegi
    private LocalDateTime bookingTime = LocalDateTime.now(); 
}