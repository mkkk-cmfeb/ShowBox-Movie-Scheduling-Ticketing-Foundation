package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.City;
import com.showbox.service.CityService;
import java.util.List;

@RestController
@RequestMapping("/api/Cities")
@CrossOrigin(origins = "*")
public class CityController {

    @Autowired
    private CityService cityService;

    @GetMapping
    public List<City> getAllCities() {
        return cityService.getAllCities();
    }

    @PostMapping
    public ResponseEntity<?> addCity(@RequestBody City city) {
        try {
            return ResponseEntity.ok(cityService.addCity(city));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Ye City pehle se database mein add hai!");
        }
    }
}