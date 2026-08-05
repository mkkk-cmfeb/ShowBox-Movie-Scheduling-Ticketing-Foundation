package com.showbox.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // User linkage
    private String userEmail; 
    
    // Movie & Theatre Details (Saved as strings to avoid complex joins for the digital ticket)
    private Long showScheduleId;
    private String movieTitle;
    private String theatreName;
    
    // Time Details
    private String showDate;
    private String showTime;
    
    // Booking Details
    private String seats; // e.g., "F6, B4, J1"
    private int totalAmount;
    
    // e.g., "CONFIRMED", "PENDING", "ATTENDED" (For your Proof-of-Watch scanner later)
    private String status; 
}