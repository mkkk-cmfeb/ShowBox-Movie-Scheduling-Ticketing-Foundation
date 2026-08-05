package com.showbox.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.showbox.model.Ticket;
import com.showbox.repository.TicketRepository;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public Ticket bookTicket(Ticket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("CONFIRMED");
        }
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getUserTickets(String email) {
        return ticketRepository.findByUserEmail(email);
    }

    public List<Ticket> getShowTickets(Long showId) {
        return ticketRepository.findByShowScheduleId(showId);
    }
}