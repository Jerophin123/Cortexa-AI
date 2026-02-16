package com.dementia.riskassessment.dto;

public class AssessmentResponse {
    private String riskLevel;
    private String recommendation;

    public AssessmentResponse() {
    }

    public AssessmentResponse(String riskLevel, String recommendation) {
        this.riskLevel = riskLevel;
        this.recommendation = recommendation;
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






