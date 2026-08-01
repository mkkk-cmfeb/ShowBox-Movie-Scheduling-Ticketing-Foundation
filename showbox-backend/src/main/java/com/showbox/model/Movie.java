package com.showbox.model; 

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

// NAYA IMPORT YAHAN ADD KAREIN
import com.fasterxml.jackson.annotation.JsonProperty; 

@Entity
@Data
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String genre;
    
    // NAYA: Jackson ko force karne ke liye ki naam change na kare
    @JsonProperty("isActive") 
    private boolean isActive = true; 
}