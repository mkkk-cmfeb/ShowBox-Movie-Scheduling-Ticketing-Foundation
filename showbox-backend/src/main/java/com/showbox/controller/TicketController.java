package com.showbox.controller;

import com.showbox.model.ShowSeat;
import com.showbox.model.Ticket;
import com.showbox.repository.ShowSeatRepository;
import com.showbox.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/Bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private ShowSeatRepository showSeatRepository; // Bring in the seat repository

    @PostMapping
    public ResponseEntity<Ticket> bookTicket(@RequestBody Ticket ticket) {
        if(ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("CONFIRMED");
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Convert LOCKED seats to BOOKED permanently
        if (savedTicket.getSeats() != null) {
            String[] seatArray = savedTicket.getSeats().split(",");
            for (String s : seatArray) {
                String seatNum = s.trim();
                Optional<ShowSeat> seatOpt = showSeatRepository.findByShowScheduleIdAndSeatNumber(
                    savedTicket.getShowScheduleId(), seatNum
                );
                
                if (seatOpt.isPresent()) {
                    ShowSeat seat = seatOpt.get();
                    seat.setStatus("BOOKED");
                    seat.setLockedUntil(null); // Remove the timer
                    showSeatRepository.save(seat);
                }
            }
        }
        
        return ResponseEntity.ok(savedTicket);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable String email) {
        List<Ticket> userTickets = ticketRepository.findByUserEmail(email);
        return ResponseEntity.ok(userTickets);
    }
    
    @GetMapping("/show/{showId}")
    public ResponseEntity<List<Ticket>> getShowTickets(@PathVariable Long showId) {
        List<Ticket> showTickets = ticketRepository.findByShowScheduleId(showId);
        return ResponseEntity.ok(showTickets);
    }
}