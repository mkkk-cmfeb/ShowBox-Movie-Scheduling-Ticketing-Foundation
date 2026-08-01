package com.showbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.showbox.model.Booking;
import com.showbox.repository.BookingRepository;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/Bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    // Ticket Save Karna
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        bookingRepository.save(booking);
        // React ko JSON format mein success message chahiye hota hai
        return ResponseEntity.ok(Map.of("message", "Booking Confirmed successfully!"));
    }

    // My Tickets Page ke liye
    @GetMapping("/user/{email}")
    public List<Booking> getUserBookings(@PathVariable String email) {
        return bookingRepository.findByUserEmailOrderByBookingTimeDesc(email);
    }

    // Seat Blocking ke liye (Pehle se book hui seats)
    @GetMapping("/show/{showId}")
    public List<Booking> getBookingsByShow(@PathVariable Long showId) {
        return bookingRepository.findByShowId(showId);
    }
}