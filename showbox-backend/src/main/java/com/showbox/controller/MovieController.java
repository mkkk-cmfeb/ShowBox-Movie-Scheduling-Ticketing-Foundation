package com.showbox.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.showbox.model.Movie;
import com.showbox.service.MovieService;

@RestController
@RequestMapping("/api/Movies")
@CrossOrigin(origins = "*") // React frontend ko allow karne ke liye
public class MovieController {

    @Autowired
    private MovieService movieService;

    // 1. Saari movies dekhne ke liye (Home Page & Admin)
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // 2. Nayi movie add karne ke liye
    @PostMapping
    public Movie addMovie(@RequestBody Movie movie) {
        return movieService.addMovie(movie);
    }

    // 3. Movie ko Hide/Show (Active toggle) karne ke liye
    @PutMapping("/toggle/{id}")
    public ResponseEntity<?> toggleMovie(@PathVariable Long id) {
        try {
            Movie movie = movieService.toggleMovie(id);
            return ResponseEntity.ok(movie);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}