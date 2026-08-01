package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.City;
import com.showbox.repository.CityRepository;
import java.util.List;

@RestController
@RequestMapping("/api/Cities")
@CrossOrigin(origins = "*")
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping
    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addCity(@RequestBody City city) {
        // Validation: Duplicate city check
        if (cityRepository.existsByNameIgnoreCase(city.getName())) {
            return ResponseEntity.badRequest().body("Ye City pehle se database mein add hai!");
        }
        return ResponseEntity.ok(cityRepository.save(city));
    }
}