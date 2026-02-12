package com.dementia.riskassessment.dto;

public class MLServiceResponse {
    private String risk_level;

    public MLServiceResponse() {
    }

    public MLServiceResponse(String risk_level) {
        this.risk_level = risk_level;
    }

    public String getRisk_level() {
        return risk_level;
    }

    public void setRisk_level(String risk_level) {
        this.risk_level = risk_level;
    }
}




