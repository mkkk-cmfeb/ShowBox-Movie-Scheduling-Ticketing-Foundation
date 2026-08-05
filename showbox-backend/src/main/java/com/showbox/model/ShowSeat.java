package com.showbox.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Version;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class ShowSeat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long showScheduleId;
    
    private String seatNumber; // e.g., "A1", "D4"
    
    // Status can be: AVAILABLE, LOCKED, or BOOKED
    private String status = "AVAILABLE";
    
    // The timestamp when the 5-minute lock expires
    private LocalDateTime lockedUntil;
    
    // The email of the user who currently holds the lock
    private String lockedBy; 
    
    // Concurrency Control: JPA @Version annotation for Optimistic Locking
    @Version
    private Long version;
}