package com.showbox.controller;

import com.showbox.model.Campaign;
import com.showbox.model.Donation;
import com.showbox.repository.CampaignRepository;
import com.showbox.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/crowdfund")
@CrossOrigin(origins = "http://localhost:5173")
public class CrowdfundController {

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private DonationRepository donationRepository;

    // 1. Fetch all campaigns for the React frontend
    @GetMapping("/campaigns")
    public ResponseEntity<List<Campaign>> getAllCampaigns() {
        return ResponseEntity.ok(campaignRepository.findAll());
    }

    // 2. Process a new donation and update the campaign progress bar
    @PostMapping("/donate")
    public ResponseEntity<?> processDonation(@RequestBody Donation donation) {
        Optional<Campaign> campaignOpt = campaignRepository.findById(donation.getCampaignId());
        
        if (campaignOpt.isPresent()) {
            Campaign campaign = campaignOpt.get();
            
            // Save the donation record
            Donation savedDonation = donationRepository.save(donation);
            
            // Update the campaign's total raised amount
            double currentRaised = campaign.getRaisedAmount() == null ? 0 : campaign.getRaisedAmount();
            campaign.setRaisedAmount(currentRaised + donation.getAmount());
            campaignRepository.save(campaign);
            
            return ResponseEntity.ok(savedDonation);
        } else {
            return ResponseEntity.status(404).body("Campaign not found");
        }
    }
    
 // 3. Create a new campaign (Admin Only)
    @PostMapping("/campaigns")
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        // When a new campaign starts, the raised amount is always 0
        campaign.setRaisedAmount(0.0);
        Campaign savedCampaign = campaignRepository.save(campaign);
        return ResponseEntity.ok(savedCampaign);
    }

    // 4. Delete a campaign (Admin Only)
    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable Long id) {
        if(campaignRepository.existsById(id)) {
            campaignRepository.deleteById(id);
            return ResponseEntity.ok("Campaign deleted successfully.");
        }
        return ResponseEntity.status(404).body("Campaign not found.");
    }
}