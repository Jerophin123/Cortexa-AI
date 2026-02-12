package com.dementia.riskassessment.service;

import com.dementia.riskassessment.dto.AssessmentRequest;
import com.dementia.riskassessment.dto.AssessmentResponse;
import com.dementia.riskassessment.dto.MLServiceRequest;
import com.dementia.riskassessment.dto.MLServiceResponse;
import com.dementia.riskassessment.entity.Assessment;
import com.dementia.riskassessment.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AssessmentService {
    
    private final MLServiceClient mlServiceClient;
    private final AssessmentRepository assessmentRepository;
    
    @Autowired
    public AssessmentService(MLServiceClient mlServiceClient, AssessmentRepository assessmentRepository) {
        this.mlServiceClient = mlServiceClient;
        this.assessmentRepository = assessmentRepository;
    }
    
    @Transactional
    public AssessmentResponse processAssessment(AssessmentRequest request) {
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
        
        assessmentRepository.save(assessment);
        
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
}




