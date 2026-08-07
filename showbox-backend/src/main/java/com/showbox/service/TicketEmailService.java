package com.showbox.service;

import com.showbox.model.Ticket;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TicketEmailService {

    private static final Logger log = LoggerFactory.getLogger(TicketEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendTicketConfirmation(Ticket ticket) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(ticket.getUserEmail());
            helper.setSubject("Your ShowBox Ticket - " + ticket.getMovieTitle());
            helper.setText(buildEmailBody(ticket), true);

            mailSender.send(message);
            log.info("Ticket confirmation email sent to {}", ticket.getUserEmail());

        } catch (Exception e) {
            log.error("Failed to send ticket email for ticket {}: {}", ticket.getId(), e.getMessage());
        }
    }

    private String buildEmailBody(Ticket ticket) {
        return "<div style='font-family:sans-serif;'>"
                + "<h2 style='color:#e74c3c;'>Booking Confirmed!</h2>"
                + "<p>Hi,</p>"
                + "<p>Your ticket for <b>" + ticket.getMovieTitle() + "</b> is confirmed.</p>"
                + "<ul>"
                + "<li><b>Theatre:</b> " + ticket.getTheatreName() + "</li>"
                + "<li><b>Date:</b> " + ticket.getShowDate() + "</li>"
                + "<li><b>Time:</b> " + ticket.getShowTime() + "</li>"
                + "<li><b>Seats:</b> " + ticket.getSeats() + "</li>"
                + "<li><b>Total Paid:</b> Rs. " + ticket.getTotalAmount() + "</li>"
                + "<li><b>Ticket ID:</b> #" + ticket.getId() + "</li>"
                + "</ul>"
                + "<p>See you at the movies!</p>"
                + "</div>";
    }
}