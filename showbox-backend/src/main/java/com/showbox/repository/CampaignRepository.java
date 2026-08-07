package com.showbox.repository;
import com.showbox.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CampaignRepository extends JpaRepository<Campaign, Long> {}