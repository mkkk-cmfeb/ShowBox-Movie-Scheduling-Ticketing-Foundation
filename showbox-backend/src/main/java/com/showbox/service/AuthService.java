package com.showbox.service;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.showbox.model.User;
import com.showbox.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final String SECRET = "MySuperSecretKeyForShowboxProjectWhichMustBeVeryLong2026";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public void registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }

        if (userRepository.count() == 0) {
            user.setRole("ADMIN");
        }

        userRepository.save(user);
    }

    public Map<String, Object> loginUser(User loginRequest) {
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

                return Map.of(
                        "token", jwtToken,
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "role", user.getRole()
                );
            }
        }
        throw new IllegalArgumentException("Invalid Email or Password");
    }
}