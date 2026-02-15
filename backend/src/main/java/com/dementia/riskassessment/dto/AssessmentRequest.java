package com.dementia.riskassessment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AssessmentRequest {
    
    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be positive")
    @Max(value = 120, message = "Age must be less than 120")
    private Integer age;
    
    @NotNull(message = "Reaction time is required")
    @Positive(message = "Reaction time must be positive")
    private Double reaction_time_ms;
    
    @NotNull(message = "Memory score is required")
    @Min(value = 0, message = "Memory score must be between 0 and 100")
    @Max(value = 100, message = "Memory score must be between 0 and 100")
    private Double memory_score;
    
    @NotNull(message = "Speech pause is required")
    @Positive(message = "Speech pause must be positive")
    private Double speech_pause_ms;
    
    @NotNull(message = "Word repetition rate is required")
    @Min(value = 0, message = "Word repetition rate must be between 0 and 1")
    @Max(value = 1, message = "Word repetition rate must be between 0 and 1")
    private Double word_repetition_rate;
    
    @NotNull(message = "Task error rate is required")
    @Min(value = 0, message = "Task error rate must be between 0 and 1")
    @Max(value = 1, message = "Task error rate must be between 0 and 1")
    private Double task_error_rate;
    
    @NotNull(message = "Sleep hours is required")
    @Min(value = 0, message = "Sleep hours must be between 0 and 24")
    @Max(value = 24, message = "Sleep hours must be between 0 and 24")
    private Double sleep_hours;
    
    private Long userId; // Optional - for linking assessment to user

    // Getters and Setters
    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Double getReaction_time_ms() {
        return reaction_time_ms;
    }

    public void setReaction_time_ms(Double reaction_time_ms) {
        this.reaction_time_ms = reaction_time_ms;
    }

    public Double getMemory_score() {
        return memory_score;
    }

    public void setMemory_score(Double memory_score) {
        this.memory_score = memory_score;
    }

    public Double getSpeech_pause_ms() {
        return speech_pause_ms;
    }

    public void setSpeech_pause_ms(Double speech_pause_ms) {
        this.speech_pause_ms = speech_pause_ms;
    }

    public Double getWord_repetition_rate() {
        return word_repetition_rate;
    }

    public void setWord_repetition_rate(Double word_repetition_rate) {
        this.word_repetition_rate = word_repetition_rate;
    }

    public Double getTask_error_rate() {
        return task_error_rate;
    }

    public void setTask_error_rate(Double task_error_rate) {
        this.task_error_rate = task_error_rate;
    }

    public Double getSleep_hours() {
        return sleep_hours;
    }

    public void setSleep_hours(Double sleep_hours) {
        this.sleep_hours = sleep_hours;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}





