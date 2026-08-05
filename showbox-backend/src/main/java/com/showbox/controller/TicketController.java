package com.showbox.controller;

import com.showbox.model.Ticket;
import com.showbox.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/Bookings")
@CrossOrigin(origins = "http://localhost:5173") // Allows your React app to connect safely
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    // 1. Create a new booking
    @PostMapping
    public ResponseEntity<Ticket> bookTicket(@RequestBody Ticket ticket) {
        // Automatically set status to CONFIRMED for now (before Razorpay integration)
        if(ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("CONFIRMED");
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        return ResponseEntity.ok(savedTicket);
    }

    // 2. Fetch all bookings for the logged-in user's MyBookings page
    @GetMapping("/user/{email}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable String email) {
        List<Ticket> userTickets = ticketRepository.findByUserEmail(email);
        return ResponseEntity.ok(userTickets);
    }
    
 // 3. Fetch all bookings for a specific show (to block booked seats on the map)
    @GetMapping("/show/{showId}")
    public ResponseEntity<List<Ticket>> getShowTickets(@PathVariable Long showId) {
        List<Ticket> showTickets = ticketRepository.findByShowScheduleId(showId);
        return ResponseEntity.ok(showTickets);
    }
}