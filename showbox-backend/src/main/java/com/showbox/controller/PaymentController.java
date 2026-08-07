package com.showbox.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    // ⚠️ PASTE YOUR RAZORPAY TEST KEYS HERE
    private static final String KEY_ID = "rzp_test_TMVnVixTkdMS28";
    private static final String KEY_SECRET = "Ud4bFW5I3qiCJG4JL7ZYqRok";

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            // Get the total amount from React
            int amount = (int) data.get("amount");

            // Initialize Razorpay Client
            RazorpayClient razorpay = new RazorpayClient(KEY_ID, KEY_SECRET);

            // Create an Order Request
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100); // Razorpay accepts amount in paise (multiply by 100)
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

            // Create the order on Razorpay servers
            Order order = razorpay.orders.create(orderRequest);

            // Return the created order details to React
            return ResponseEntity.ok(order.toString());
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating Razorpay Order"));
        }
    }
}