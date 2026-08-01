package com.showbox.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.showbox.model.Movie;
import com.showbox.repository.MovieRepository;

@RestController
@RequestMapping("/api/Movies")
@CrossOrigin(origins = "*") // React frontend ko allow karne ke liye
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    // 1. Saari movies dekhne ke liye (Home Page & Admin)
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // 2. Nayi movie add karne ke liye
    @PostMapping
    public Movie addMovie(@RequestBody Movie movie) {
        return movieRepository.save(movie);
    }

    // 3. Movie ko Hide/Show (Active toggle) karne ke liye
    @PutMapping("/toggle/{id}")
    public ResponseEntity<Movie> toggleMovie(@PathVariable Long id) {
        Movie movie = movieRepository.findById(id).orElse(null);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }
        
        movie.setActive(!movie.isActive());
        movieRepository.save(movie);
        return ResponseEntity.ok(movie);
    }
}