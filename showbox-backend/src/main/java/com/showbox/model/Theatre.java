package com.showbox.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
public class Theatre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Long cityId; // Ye batayega ki Theatre kis City mein hai
    private String uniqueId; // React mein dropdown ke liye

    // Database mein save hone se pehle ye function khud ek Unique ID bana dega
    @PrePersist
    public void generateUniqueId() {
        this.uniqueId = "T-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}