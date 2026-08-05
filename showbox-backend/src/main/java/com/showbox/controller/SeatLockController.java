package com.showbox.controller;

import com.showbox.model.ShowSeat;
import com.showbox.repository.ShowSeatRepository;
import com.showbox.service.SeatLockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/Seats")
@CrossOrigin(origins = "http://localhost:5173")
public class SeatLockController {

    @Autowired
    private SeatLockService seatLockService;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    // 1. Endpoint to Lock a seat when clicked
    @PostMapping("/lock")
    public ResponseEntity<?> lockSeat(@RequestBody Map<String, String> payload) {
        Long showId = Long.parseLong(payload.get("showId"));
        String seatNumber = payload.get("seatNumber");
        String userEmail = payload.get("userEmail");

        boolean isLocked = seatLockService.lockSeat(showId, seatNumber, userEmail);
        
        if (isLocked) {
            return ResponseEntity.ok().body(Map.of("message", "Seat locked successfully"));
        } else {
            // 409 Conflict: Seat is already taken by someone else
            return ResponseEntity.status(409).body(Map.of("message", "Seat is currently unavailable")); 
        }
    }

    // 2. Endpoint to Unlock a seat if the user deselects it
    @PostMapping("/unlock")
    public ResponseEntity<?> unlockSeat(@RequestBody Map<String, String> payload) {
        Long showId = Long.parseLong(payload.get("showId"));
        String seatNumber = payload.get("seatNumber");
        String userEmail = payload.get("userEmail");

        seatLockService.unlockSeat(showId, seatNumber, userEmail);
        return ResponseEntity.ok().body(Map.of("message", "Seat unlocked successfully"));
    }

    // 3. Endpoint to fetch all currently locked seats for the map rendering
    @GetMapping("/locked/{showId}")
    public ResponseEntity<List<ShowSeat>> getLockedSeats(@PathVariable Long showId) {
        List<ShowSeat> seats = showSeatRepository.findByShowScheduleId(showId);
        return ResponseEntity.ok(seats);
    }
}