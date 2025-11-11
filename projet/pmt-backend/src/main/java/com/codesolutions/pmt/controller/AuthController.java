package com.codesolutions.pmt.controller;

import com.codesolutions.pmt.dto.LoginDto;
import com.codesolutions.pmt.dto.UserDto;
import com.codesolutions.pmt.dto.UserRegistrationDto;
import com.codesolutions.pmt.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication operations
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:80"})
public class AuthController {
    
    private final UserService userService;
    
    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserRegistrationDto registrationDto) {
        log.info("Registration request for email: {}", registrationDto.getEmail());
        UserDto user = userService.register(registrationDto);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }
    
    /**
     * Login user
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody LoginDto loginDto) {
        log.info("Login request for email: {}", loginDto.getEmail());
        UserDto user = userService.login(loginDto);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Get current user by email
     * GET /api/auth/user?email={email}
     */
    @GetMapping("/user")
    public ResponseEntity<UserDto> getCurrentUser(@RequestParam String email) {
        log.info("Get user request for email: {}", email);
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
}
