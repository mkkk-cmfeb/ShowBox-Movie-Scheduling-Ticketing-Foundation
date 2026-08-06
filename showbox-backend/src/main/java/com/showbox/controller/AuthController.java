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

    private final String SECRET = "MySuperSecretKeyForShowboxProjectWhichMustBeVeryLong2026";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
    if (user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
        return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid email address!"));
    }

    if (userRepository.existsByEmail(user.getEmail())) {
        return ResponseEntity.badRequest().body(Map.of("message", "Email already exists!"));
    }

    if (user.getPhone() == null || !user.getPhone().matches("\\d{10}")) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid number! Number should be 10 digits long!"));
    }

    if (userRepository.existsByPhone(user.getPhone())) {
        return ResponseEntity.badRequest().body(Map.of("message", "Phone number already registered!"));
    }

        if(userRepository.count() == 0) {
            user.setRole("ADMIN");
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            if (loginRequest.getPassword().equals(user.getPassword())) {
                
                String jwtToken = Jwts.builder()
                        .subject(user.getEmail())
                        .claim("role", user.getRole()) 
                        .claim("name", user.getName())
                        .issuedAt(new Date())
                        .expiration(new Date(System.currentTimeMillis() + 86400000))
                        .signWith(key)
                        .compact();

                return ResponseEntity.ok(Map.of(
                        "token", jwtToken,
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "role", user.getRole()
                ));
            }
        }
        // 🛠️ NAYA: Error ko JSON format mein bhejna
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Email or Password"));
    }
}