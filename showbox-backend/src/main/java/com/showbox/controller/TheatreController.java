package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.Theatre;
import com.showbox.repository.TheatreRepository;
import java.util.List;

@RestController
@RequestMapping("/api/Theatres")
@CrossOrigin(origins = "*")
public class TheatreController {

    @Autowired
    private TheatreRepository theatreRepository;

    @GetMapping
    public List<Theatre> getAllTheatres() {
        return theatreRepository.findAll();
    }

    @PostMapping
    public Theatre addTheatre(@RequestBody Theatre theatre) {
        return theatreRepository.save(theatre);
    }
}