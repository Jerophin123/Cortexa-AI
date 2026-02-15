package com.dementia.riskassessment.dto;

import java.time.LocalDateTime;

public class AssessmentHistoryDTO {
    private Long id;
    private LocalDateTime timestamp;
    private String patientName;
    private Integer age;
    private String riskLevel;
    private String recommendation;
    
    public AssessmentHistoryDTO() {
    }
    
    public AssessmentHistoryDTO(Long id, LocalDateTime timestamp, String patientName, 
                               Integer age, String riskLevel, String recommendation) {
        this.id = id;
        this.timestamp = timestamp;
        this.patientName = patientName;
        this.age = age;
        this.riskLevel = riskLevel;
        this.recommendation = recommendation;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getPatientName() {
        return patientName;
    }
    
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
    
    public Integer getAge() {
        return age;
    }
    
    public void setAge(Integer age) {
        this.age = age;
    }
    
    public String getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public String getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}

