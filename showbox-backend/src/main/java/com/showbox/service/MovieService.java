package com.showbox.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.showbox.model.Movie;
import com.showbox.repository.MovieRepository;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie toggleMovie(Long id) {
        Movie movie = movieRepository.findById(id).orElse(null);
        if (movie == null) {
            throw new IllegalArgumentException("Movie not found");
        }
        movie.setActive(!movie.isActive());
        return movieRepository.save(movie);
    }
}