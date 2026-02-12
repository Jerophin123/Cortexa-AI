package com.dementia.riskassessment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.annotation.PostConstruct;
import java.io.File;

@SpringBootApplication
public class DementiaRiskAssessmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(DementiaRiskAssessmentApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Ensure data directory exists
        File dataDir = new File("./data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
            System.out.println("Created data directory: " + dataDir.getAbsolutePath());
        }
    }
}

