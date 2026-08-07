package com.showbox.model;

import jakarta.persistence.*;

@Entity
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private Double targetAmount;
    private Double raisedAmount;
  //  private String imageUrl;
    
    private String imageUrl; // Your existing field

    // ADD THESE NEW FIELDS:
    private Long movieId;
    private Long cityId;
    private Long theatreId;

    // ADD THEIR GETTERS AND SETTERS:
    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }

    public Long getTheatreId() { return theatreId; }
    public void setTheatreId(Long theatreId) { this.theatreId = theatreId; }
    
    

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(Double targetAmount) { this.targetAmount = targetAmount; }
    
    public Double getRaisedAmount() { return raisedAmount; }
    public void setRaisedAmount(Double raisedAmount) { this.raisedAmount = raisedAmount; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}