package com.dementia.riskassessment.service;

import com.dementia.riskassessment.dto.AuthResponse;
import com.dementia.riskassessment.dto.LoginRequest;
import com.dementia.riskassessment.dto.SignupRequest;
import com.dementia.riskassessment.entity.User;
import com.dementia.riskassessment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Isolation;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final int VERIFICATION_CODE_LENGTH = 6;
    private static final int VERIFICATION_CODE_EXPIRY_HOURS = 24;
    
    @Autowired
    public AuthService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    
    public AuthResponse signup(SignupRequest request) {
        // Retry logic for SQLite database lock and connection timeout issues
        int maxRetries = 3;
        int retryDelay = 200; // milliseconds - increased to allow connections to be released
        
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return performSignup(request);
            } catch (Exception e) {
                // Check if it's a database lock, rollback, or connection timeout error
                String errorMessage = e.getMessage() != null ? e.getMessage() : "";
                String causeMessage = e.getCause() != null && e.getCause().getMessage() != null 
                    ? e.getCause().getMessage() : "";
                String fullError = (errorMessage + " " + causeMessage).toLowerCase();
                
                if (fullError.contains("database is locked") || 
                    fullError.contains("sqlite_busy") ||
                    fullError.contains("locked") ||
                    fullError.contains("busy") ||
                    fullError.contains("rollback") ||
                    fullError.contains("unable to rollback") ||
                    fullError.contains("connection is not available") ||
                    fullError.contains("request timed out") ||
                    fullError.contains("hikaripool") ||
                    fullError.contains("timeout")) {
                    
                    if (attempt < maxRetries - 1) {
                        // Wait before retrying with exponential backoff
                        // Longer delay to allow connections to be released
                        try {
                            Thread.sleep(retryDelay * (attempt + 1)); // 200ms, 400ms, 600ms
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            return new AuthResponse(false, "Signup interrupted. Please try again.");
                        }
                        continue; // Retry
                    } else {
                        // Last attempt failed
                        return new AuthResponse(false, "Database is temporarily busy. Please try again in a moment.");
                    }
                } else {
                    // Not a retryable error, return error response
                    return new AuthResponse(false, "Signup failed: " + (errorMessage.isEmpty() ? "Unknown error" : errorMessage));
                }
            }
        }
        
        return new AuthResponse(false, "Signup failed. Please try again.");
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED, timeout = 20)
    private AuthResponse performSignup(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already registered");
        }
        
        // Hash password (simple SHA-256 for now, in production use BCrypt)
        String hashedPassword = hashPassword(request.getPassword());
        
        // Create new user
        User user = new User(
            request.getEmail(),
            hashedPassword,
            request.getFirstName(),
            request.getLastName(),
            request.getAge(),
            request.getGender(),
            request.getBloodGroup()
        );
        
        // Generate verification code
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusHours(VERIFICATION_CODE_EXPIRY_HOURS));
        user.setEmailVerified(false);
        
        user = userRepository.save(user);
        
        // Flush to ensure the save is committed immediately
        userRepository.flush();
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationCode);
        } catch (Exception e) {
            // Log error but don't fail signup
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getAge(),
            user.getGender(),
            user.getBloodGroup()
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);
        
        if (user == null) {
            return new AuthResponse(false, "Invalid email or password");
        }
        
        // Verify password
        String hashedPassword = hashPassword(request.getPassword());
        if (!user.getPassword().equals(hashedPassword)) {
            return new AuthResponse(false, "Invalid email or password");
        }
        
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getAge(),
            user.getGender(),
            user.getBloodGroup()
        );
    }
    
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
    
    public AuthResponse verifyEmail(String email, String verificationCode) {
        User user = userRepository.findByEmail(email)
            .orElse(null);
        
        if (user == null) {
            return new AuthResponse(false, "User not found");
        }
        
        if (user.getEmailVerified()) {
            return new AuthResponse(false, "Email already verified");
        }
        
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(verificationCode)) {
            return new AuthResponse(false, "Invalid verification code");
        }
        
        if (user.getVerificationCodeExpiry() == null || user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            return new AuthResponse(false, "Verification code has expired. Please request a new one.");
        }
        
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
        userRepository.flush();
        
        return new AuthResponse(true, "Email verified successfully");
    }
    
    public AuthResponse resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
            .orElse(null);
        
        if (user == null) {
            return new AuthResponse(false, "User not found");
        }
        
        if (user.getEmailVerified()) {
            return new AuthResponse(false, "Email already verified");
        }
        
        // Generate new verification code
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusHours(VERIFICATION_CODE_EXPIRY_HOURS));
        userRepository.save(user);
        userRepository.flush();
        
        // Send verification email
        try {
            emailService.sendResendVerificationEmail(user.getEmail(), user.getFirstName(), verificationCode);
            return new AuthResponse(true, "Verification code sent to your email");
        } catch (Exception e) {
            return new AuthResponse(false, "Failed to send verification email: " + e.getMessage());
        }
    }
}

