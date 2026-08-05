package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.Theatre;
import com.showbox.service.TheatreService;
import java.util.List;

@RestController
@RequestMapping("/api/Theatres")
@CrossOrigin(origins = "*")
public class TheatreController {

    @Autowired
    private TheatreService theatreService;

    @GetMapping
    public List<Theatre> getAllTheatres() {
        return theatreService.getAllTheatres();
    }

    @PostMapping
    public Theatre addTheatre(@RequestBody Theatre theatre) {
        return theatreService.addTheatre(theatre);
    }
}