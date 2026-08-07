package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.ShowSchedule;
import com.showbox.repository.ShowScheduleRepository;
import java.util.List;

@RestController
@RequestMapping("/api/ShowSchedules")
@CrossOrigin(origins = "*")
public class ShowScheduleController {

    @Autowired
    private ShowScheduleRepository showScheduleRepository;

    @GetMapping
    public List<ShowSchedule> getAllSchedules() {
        return showScheduleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addSchedule(@RequestBody ShowSchedule schedule) {
        // Validation: No Overlap Rule
        if (showScheduleRepository.hasTimeConflict(schedule.getTheatreId(), schedule.getShowTime(), schedule.getEndTime())) {
            return ResponseEntity.badRequest().body("Clash Error! Movie is already running in this theatre.");
        }
        return ResponseEntity.ok(showScheduleRepository.save(schedule));
    }
}