package com.showbox.repository;

import com.showbox.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // This custom method automatically tells Spring to find tickets by the user's email
    List<Ticket> findByUserEmail(String userEmail);
    
    List<Ticket> findByShowScheduleId(Long showScheduleId);
}