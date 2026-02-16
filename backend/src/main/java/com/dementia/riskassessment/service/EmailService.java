package com.dementia.riskassessment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${app.email.from-name:Dementia Risk Assessment}")
    private String fromName;
    
    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        // Debug: Log email configuration status
        if (fromEmail != null && !fromEmail.isEmpty()) {
            System.out.println("Email service configured with: " + fromEmail);
        } else {
            System.out.println("Email service NOT configured - fromEmail is empty or null");
            System.out.println("Environment EMAIL_USERNAME: " + System.getenv("EMAIL_USERNAME"));
        }
    }
    
    public void sendVerificationEmail(String toEmail, String firstName, String verificationCode) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            System.err.println("Email service not configured. Skipping verification email to " + toEmail);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Cortexa AI");
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email Address - Cortexa AI");
            
            String htmlBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
                "  .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }" +
                "  .header h1 { margin: 0; font-size: 28px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; }" +
                "  .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }" +
                "  .message { font-size: 16px; color: #555; margin-bottom: 30px; }" +
                "  .code-container { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }" +
                "  .code-label { color: rgba(255, 255, 255, 0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-weight: 500; }" +
                "  .verification-code { font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }" +
                "  .expiry { color: #666; font-size: 14px; margin-top: 20px; }" +
                "  .footer { background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }" +
                "  .footer-text { color: #666; font-size: 14px; margin: 5px 0; }" +
                "  .signature { color: #667eea; font-weight: 600; font-size: 16px; margin-top: 10px; }" +
                "  .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; color: #856404; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>🔐 Email Verification</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <div class='greeting'>Hello %s,</div>" +
                "      <div class='message'>" +
                "        Thank you for registering with Cortexa AI! To complete your registration, please verify your email address by entering the verification code below." +
                "      </div>" +
                "      <div class='code-container'>" +
                "        <div class='code-label'>Your Verification Code</div>" +
                "        <div class='verification-code'>%s</div>" +
                "      </div>" +
                "      <div class='expiry'>⏰ This code will expire in 24 hours</div>" +
                "      <div class='warning'>" +
                "        <strong>⚠️ Security Notice:</strong> If you did not create an account, please ignore this email. Never share your verification code with anyone." +
                "      </div>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      <div class='footer-text'>Need help? Contact our support team.</div>" +
                "      <div class='signature'>Best regards,<br>Team Cortexa</div>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>",
                firstName,
                verificationCode
            );
            
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void sendAssessmentResultsEmail(String toEmail, String firstName, String lastName,
                                          String riskLevel, String recommendation,
                                          Integer age, Double reactionTime, Double memoryScore,
                                          Double speechPause, Double wordRepetition,
                                          Double taskError, Double sleepHours) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            System.err.println("Email service not configured. Skipping assessment results email to " + toEmail);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Cortexa AI");
            helper.setTo(toEmail);
            helper.setSubject("Your Assessment Results - Cortexa AI");
            
            // Determine risk level color
            String riskColor;
            String riskIcon;
            if (riskLevel != null) {
                String riskLower = riskLevel.toLowerCase();
                if (riskLower.contains("low")) {
                    riskColor = "#28a745"; // Green
                    riskIcon = "✅";
                } else if (riskLower.contains("medium")) {
                    riskColor = "#ffc107"; // Yellow
                    riskIcon = "⚠️";
                } else {
                    riskColor = "#dc3545"; // Red
                    riskIcon = "🔴";
                }
            } else {
                riskColor = "#667eea";
                riskIcon = "📊";
            }
            
            String htmlBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
                "  .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }" +
                "  .header h1 { margin: 0; font-size: 28px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; }" +
                "  .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }" +
                "  .message { font-size: 16px; color: #555; margin-bottom: 30px; }" +
                "  .results-box { background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid %s; }" +
                "  .risk-level { font-size: 24px; font-weight: 700; color: %s; margin: 15px 0; }" +
                "  .details-table { width: 100%%; margin: 20px 0; border-collapse: collapse; }" +
                "  .details-table td { padding: 10px; border-bottom: 1px solid #e9ecef; }" +
                "  .details-table td:first-child { font-weight: 600; color: #555; width: 50%%; }" +
                "  .details-table td:last-child { color: #333; }" +
                "  .recommendation-box { background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 25px 0; border-radius: 4px; }" +
                "  .recommendation-title { font-weight: 600; color: #1976D2; margin-bottom: 10px; font-size: 16px; }" +
                "  .disclaimer { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; color: #856404; }" +
                "  .footer { background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }" +
                "  .footer-text { color: #666; font-size: 14px; margin: 5px 0; }" +
                "  .signature { color: #667eea; font-weight: 600; font-size: 16px; margin-top: 10px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>📊 Assessment Results</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <div class='greeting'>Hello %s %s,</div>" +
                "      <div class='message'>" +
                "        Thank you for completing your cognitive risk assessment with Cortexa AI. Below are your detailed results." +
                "      </div>" +
                "      <div class='results-box'>" +
                "        <div style='font-weight: 600; color: #555; margin-bottom: 10px;'>Risk Level</div>" +
                "        <div class='risk-level'>%s %s</div>" +
                "        <table class='details-table'>" +
                "          <tr><td>Age</td><td>%d years</td></tr>" +
                "          <tr><td>Reaction Time</td><td>%.2f ms</td></tr>" +
                "          <tr><td>Memory Score</td><td>%.2f</td></tr>" +
                "          <tr><td>Speech Pause</td><td>%.2f ms</td></tr>" +
                "          <tr><td>Word Repetition Rate</td><td>%.2f</td></tr>" +
                "          <tr><td>Task Error Rate</td><td>%.2f</td></tr>" +
                "          <tr><td>Sleep Hours</td><td>%.2f hours</td></tr>" +
                "        </table>" +
                "      </div>" +
                "      <div class='recommendation-box'>" +
                "        <div class='recommendation-title'>💡 Recommendation</div>" +
                "        <div style='color: #333;'>%s</div>" +
                "      </div>" +
                "      <div class='disclaimer'>" +
                "        <strong>⚠️ Important Disclaimer:</strong> This assessment is a screening tool and not a medical diagnosis. Please consult with a healthcare professional for a comprehensive evaluation." +
                "      </div>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      <div class='footer-text'>Need help? Contact our support team.</div>" +
                "      <div class='signature'>Best regards,<br>Team Cortexa</div>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>",
                riskColor,
                riskColor,
                firstName,
                lastName,
                riskIcon,
                riskLevel != null ? riskLevel : "Unknown",
                age,
                reactionTime,
                memoryScore,
                speechPause,
                wordRepetition,
                taskError,
                sleepHours,
                recommendation
            );
            
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send assessment results email: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void sendResendVerificationEmail(String toEmail, String firstName, String verificationCode) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            System.err.println("Email service not configured. Skipping resend verification email to " + toEmail);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Cortexa AI");
            helper.setTo(toEmail);
            helper.setSubject("Your New Verification Code - Cortexa AI");
            
            String htmlBody = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
                "  .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }" +
                "  .header h1 { margin: 0; font-size: 28px; font-weight: 600; }" +
                "  .content { padding: 40px 30px; }" +
                "  .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }" +
                "  .message { font-size: 16px; color: #555; margin-bottom: 30px; }" +
                "  .code-container { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }" +
                "  .code-label { color: rgba(255, 255, 255, 0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-weight: 500; }" +
                "  .verification-code { font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }" +
                "  .expiry { color: #666; font-size: 14px; margin-top: 20px; }" +
                "  .footer { background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }" +
                "  .footer-text { color: #666; font-size: 14px; margin: 5px 0; }" +
                "  .signature { color: #667eea; font-weight: 600; font-size: 16px; margin-top: 10px; }" +
                "  .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; color: #856404; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>🔐 New Verification Code</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <div class='greeting'>Hello %s,</div>" +
                "      <div class='message'>" +
                "        You requested a new verification code. Please use the code below to verify your email address." +
                "      </div>" +
                "      <div class='code-container'>" +
                "        <div class='code-label'>Your New Verification Code</div>" +
                "        <div class='verification-code'>%s</div>" +
                "      </div>" +
                "      <div class='expiry'>⏰ This code will expire in 24 hours</div>" +
                "      <div class='warning'>" +
                "        <strong>⚠️ Security Notice:</strong> If you did not request this code, please ignore this email. Never share your verification code with anyone." +
                "      </div>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      <div class='footer-text'>Need help? Contact our support team.</div>" +
                "      <div class='signature'>Best regards,<br>Team Cortexa</div>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>",
                firstName,
                verificationCode
            );
            
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send resend verification email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

