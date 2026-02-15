package com.dementia.riskassessment.service;

import com.dementia.riskassessment.dto.MLServiceRequest;
import com.dementia.riskassessment.dto.MLServiceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@Service
public class MLServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${ml.service.url}")
    private String mlServiceUrl;
    
    public MLServiceClient() {
        this.restTemplate = new RestTemplate();
    }
    
    public MLServiceResponse predictRisk(MLServiceRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<MLServiceRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<MLServiceResponse> response = restTemplate.postForEntity(
                mlServiceUrl + "/predict",
                entity,
                MLServiceResponse.class
            );
            
            return response.getBody();
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to communicate with ML service: " + e.getMessage(), e);
        }
    }
}





