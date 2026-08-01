package com.showbox.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
public class ShowSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long movieId;
    private Long theatreId;
    
    private LocalDate showDate;
    private int showNumber;
    
    // Exact Start aur End Time check karne ke liye
    private LocalDateTime showTime;
    private LocalDateTime endTime;
    
    private int normalPrice;
    private int premiumPrice;
    private int executivePrice;
}