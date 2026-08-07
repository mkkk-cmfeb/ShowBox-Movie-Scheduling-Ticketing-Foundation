package com.showbox.repository;
import com.showbox.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByUserEmail(String userEmail);
}