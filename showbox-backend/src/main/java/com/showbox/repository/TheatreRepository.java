package com.showbox.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.showbox.model.Theatre;

@Repository
public interface TheatreRepository extends JpaRepository<Theatre, Long> {
}