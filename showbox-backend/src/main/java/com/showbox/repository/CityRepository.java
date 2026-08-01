package com.showbox.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.showbox.model.City;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    // Spring Boot ka Magic: Ye naam padh kar khud SQL query bana dega!
    boolean existsByNameIgnoreCase(String name); 
}