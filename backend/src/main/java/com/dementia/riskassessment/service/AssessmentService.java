package com.dementia.riskassessment.service;

import com.dementia.riskassessment.dto.AssessmentHistoryDTO;
import com.dementia.riskassessment.dto.AssessmentRequest;
import com.dementia.riskassessment.dto.AssessmentResponse;
import com.dementia.riskassessment.dto.MLServiceRequest;
import com.dementia.riskassessment.dto.MLServiceResponse;
import com.dementia.riskassessment.entity.Assessment;
import com.dementia.riskassessment.entity.User;
import com.dementia.riskassessment.repository.AssessmentRepository;
import com.dementia.riskassessment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Isolation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssessmentService {
    
    private final MLServiceClient mlServiceClient;
    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    @Autowired
    public AssessmentService(MLServiceClient mlServiceClient, AssessmentRepository assessmentRepository, 
                           UserRepository userRepository, EmailService emailService) {
        this.mlServiceClient = mlServiceClient;
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    
    public AssessmentResponse processAssessment(AssessmentRequest request) {
        // Retry logic for SQLite database lock and connection timeout issues
        int maxRetries = 3;
        int retryDelay = 200; // milliseconds
        
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return performAssessment(request);
            } catch (Exception e) {
                // Check if it's a database lock, rollback, or connection timeout error
                String errorMessage = e.getMessage() != null ? e.getMessage() : "";
                String causeMessage = e.getCause() != null && e.getCause().getMessage() != null 
                    ? e.getCause().getMessage() : "";
                String fullError = (errorMessage + " " + causeMessage).toLowerCase();
                
                if (fullError.contains("database is locked") || 
                    fullError.contains("sqlite_busy") ||
                    fullError.contains("sqlite_busy_snapshot") ||
                    fullError.contains("locked") ||
                    fullError.contains("busy") ||
                    fullError.contains("rollback") ||
                    fullError.contains("unable to rollback") ||
                    fullError.contains("connection is not available") ||
                    fullError.contains("request timed out") ||
                    fullError.contains("hikaripool") ||
                    fullError.contains("timeout") ||
                    fullError.contains("snapshot")) {
                    
                    if (attempt < maxRetries - 1) {
                        // Wait before retrying with exponential backoff
                        try {
                            Thread.sleep(retryDelay * (attempt + 1)); // 200ms, 400ms, 600ms
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Assessment processing interrupted. Please try again.", ie);
                        }
                        continue; // Retry
                    } else {
                        // Last attempt failed
                        throw new RuntimeException("Database is temporarily busy. Please try again in a moment.", e);
                    }
                } else {
                    // Not a retryable error, rethrow
                    throw e;
                }
            }
        }
        
        throw new RuntimeException("Assessment processing failed after retries. Please try again.");
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED, timeout = 20)
    private AssessmentResponse performAssessment(AssessmentRequest request) {
        // Prepare request for ML service
        MLServiceRequest mlRequest = new MLServiceRequest(
            request.getAge(),
            request.getReaction_time_ms(),
            request.getMemory_score(),
            request.getSpeech_pause_ms(),
            request.getWord_repetition_rate(),
            request.getTask_error_rate(),
            request.getSleep_hours()
        );
        
        // Call ML service
        MLServiceResponse mlResponse = mlServiceClient.predictRisk(mlRequest);
        
        // Capitalize risk level for response
        String riskLevel = capitalizeFirst(mlResponse.getRisk_level());
        
        // Generate recommendation based on risk level
        String recommendation = generateRecommendation(riskLevel);
        
        // Save assessment to database
        Assessment assessment = new Assessment(
            LocalDateTime.now(),
            request.getAge(),
            request.getReaction_time_ms(),
            request.getMemory_score(),
            request.getSpeech_pause_ms(),
            request.getWord_repetition_rate(),
            request.getTask_error_rate(),
            request.getSleep_hours(),
            mlResponse.getRisk_level()
        );
        
        // Link assessment to user if userId is provided
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user != null) {
                assessment.setUser(user);
            }
        }
        
        assessmentRepository.save(assessment);
        
        // Flush to ensure the save is committed immediately
        assessmentRepository.flush();
        
        // Send assessment results via email if user is logged in and email is verified
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user != null && user.getEmailVerified() != null && user.getEmailVerified()) {
                try {
                    emailService.sendAssessmentResultsEmail(
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        riskLevel,
                        recommendation,
                        request.getAge(),
                        request.getReaction_time_ms(),
                        request.getMemory_score(),
                        request.getSpeech_pause_ms(),
                        request.getWord_repetition_rate(),
                        request.getTask_error_rate(),
                        request.getSleep_hours()
                    );
                } catch (Exception e) {
                    // Log error but don't fail assessment
                    System.err.println("Failed to send assessment results email: " + e.getMessage());
                }
            }
        }
        
        return new AssessmentResponse(riskLevel, recommendation);
    }
    
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
    
    private String generateRecommendation(String riskLevel) {
        switch (riskLevel.toLowerCase()) {
            case "low":
                return "Maintain cognitive health monitoring. Continue regular check-ups and healthy lifestyle practices.";
            case "medium":
                return "Consider more frequent cognitive assessments and consult with a healthcare professional for further evaluation.";
            case "high":
                return "Please consult with a healthcare professional for a comprehensive evaluation and appropriate care planning.";
            default:
                return "Continue monitoring your cognitive health.";
        }
    }
    
    public List<AssessmentHistoryDTO> getAssessmentHistory(Long userId) {
        List<Assessment> assessments = assessmentRepository.findByUserIdOrderByTimestampDesc(userId);
        
        return assessments.stream().map(assessment -> {
            String patientName = "Unknown";
            if (assessment.getUser() != null) {
                patientName = assessment.getUser().getFirstName() + " " + assessment.getUser().getLastName();
            }
            
            String riskLevel = capitalizeFirst(assessment.getRisk_label());
            String recommendation = generateRecommendation(assessment.getRisk_label());
            
            return new AssessmentHistoryDTO(
                assessment.getId(),
                assessment.getTimestamp(),
                patientName,
                assessment.getAge(),
                riskLevel,
                recommendation
            );
        }).collect(Collectors.toList());
    }
}





