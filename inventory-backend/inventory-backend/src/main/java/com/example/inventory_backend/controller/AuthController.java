package com.example.inventory_backend.controller;

import com.example.inventory_backend.entity.User;
import com.example.inventory_backend.repository.UserRepository;
import com.example.inventory_backend.security.JwtUnit;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository repo;
    private final JwtUnit jwtUnit;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    public AuthController(UserRepository repo, JwtUnit jwtUnit) {
        this.repo = repo;
        this.jwtUnit = jwtUnit;
    }

    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<?> register(@RequestBody User user) {
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return org.springframework.http.ResponseEntity
                .badRequest()
                .body("User with this email already exists");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
        return org.springframework.http.ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public Object login(@RequestBody User user) {
        return repo.findAll()
                .stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(user.getEmail()))
                .filter(existing -> encoder.matches(user.getPassword(), existing.getPassword()))
                .findFirst()
                .map(existing -> {
                    String token = jwtUnit.generateToken(existing.getEmail(), existing.getRole());
                    return Map.of(
                        "token", token,
                        "role", existing.getRole()
                    );
                })
                .orElse(Map.of("error", "Invalid credentials"));
    }
}