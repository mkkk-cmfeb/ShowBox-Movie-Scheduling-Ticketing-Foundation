package com.showbox.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.showbox.model.Movie;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    // JpaRepository apne aap findById, findAll, save, delete jaise methods provide kar deta hai!
}