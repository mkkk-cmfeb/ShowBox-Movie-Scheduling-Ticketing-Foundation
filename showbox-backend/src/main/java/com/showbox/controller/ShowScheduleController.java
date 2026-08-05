package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.ShowSchedule;
import com.showbox.service.ShowScheduleService;
import java.util.List;

@RestController
@RequestMapping("/api/ShowSchedules")
@CrossOrigin(origins = "*")
public class ShowScheduleController {

    @Autowired
    private ShowScheduleService showScheduleService;

    @GetMapping
    public List<ShowSchedule> getAllSchedules() {
        return showScheduleService.getAllSchedules();
    }

    @PostMapping
    public ResponseEntity<?> addSchedule(@RequestBody ShowSchedule schedule) {
        try {
            return ResponseEntity.ok(showScheduleService.addSchedule(schedule));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Clash Error! Is theatre mein is time par pehle se ek show chal raha hai.");
        }
    }
}