package com.showbox.controller;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.showbox.model.User;
import com.showbox.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@RestController
@RequestMapping("/api/Auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // JWT banane ke liye secret key
    private final String SECRET = "MySuperSecretKeyForShowboxProjectWhichMustBeVeryLong2026";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // 1. REGISTER API (Saves Plain Text Password)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        // Pehla user hamesha "ADMIN" banega, baaki sab "CUSTOMER"
        if(userRepository.count() == 0) {
            user.setRole("ADMIN");
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    // 2. LOGIN API (Checks Plain Text Password)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // NAYA: Plain text comparison (No BCrypt)
            if (loginRequest.getPassword().equals(user.getPassword())) {
                
                // JWT TOKEN GENERATION
                String jwtToken = Jwts.builder()
                        .subject(user.getEmail())
                        .claim("role", user.getRole()) 
                        .claim("name", user.getName())
                        .issuedAt(new Date())
                        .expiration(new Date(System.currentTimeMillis() + 86400000)) // 1 Day Expiry
                        .signWith(key)
                        .compact();

                // Token aur Details React ko bhejna
                return ResponseEntity.ok(Map.of(
                        "token", jwtToken,
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "role", user.getRole()
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Email or Password");
    }
}