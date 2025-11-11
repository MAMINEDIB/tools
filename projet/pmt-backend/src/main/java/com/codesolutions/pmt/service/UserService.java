package com.codesolutions.pmt.service;

import com.codesolutions.pmt.dto.LoginDto;
import com.codesolutions.pmt.dto.UserDto;
import com.codesolutions.pmt.dto.UserRegistrationDto;
import com.codesolutions.pmt.entity.User;
import com.codesolutions.pmt.exception.BusinessException;
import com.codesolutions.pmt.exception.ResourceNotFoundException;
import com.codesolutions.pmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for user management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Register a new user
     */
    @Transactional
    public UserDto register(UserRegistrationDto registrationDto) {
        log.info("Registering new user: {}", registrationDto.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new BusinessException("Email already exists: " + registrationDto.getEmail());
        }
        
        // Create new user
        User user = User.builder()
                .email(registrationDto.getEmail())
                .password(passwordEncoder.encode(registrationDto.getPassword()))
                .firstName(registrationDto.getFirstName())
                .lastName(registrationDto.getLastName())
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getId());
        
        return mapToDto(savedUser);
    }
    
    /**
     * Login user
     */
    @Transactional(readOnly = true)
    public UserDto login(LoginDto loginDto) {
        log.info("User login attempt: {}", loginDto.getEmail());
        
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));
        
        // Verify password
        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            throw new BusinessException("Invalid email or password");
        }
        
        log.info("User logged in successfully: {}", user.getId());
        return mapToDto(user);
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDto(user);
    }
    
    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToDto(user);
    }
    
    /**
     * Get user entity by ID (internal use)
     */
    @Transactional(readOnly = true)
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
    
    /**
     * Get user entity by email (internal use)
     */
    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
    
    /**
     * Map User entity to UserDto
     */
    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .build();
    }
}
