package com.dementia.riskassessment.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailConfig {
    // Email configuration is handled via application.properties
    // EmailService will gracefully handle missing email credentials
}

