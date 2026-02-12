package com.dementia.riskassessment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
public class Assessment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE, generator = "assessment_id_generator")
    @TableGenerator(
        name = "assessment_id_generator",
        table = "id_generator",
        pkColumnName = "gen_name",
        valueColumnName = "gen_value",
        pkColumnValue = "assessment_id",
        initialValue = 1,
        allocationSize = 1
    )
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private Integer age;
    
    @Column(nullable = false)
    private Double reaction_time_ms;
    
    @Column(nullable = false)
    private Double memory_score;
    
    @Column(nullable = false)
    private Double speech_pause_ms;
    
    @Column(nullable = false)
    private Double word_repetition_rate;
    
    @Column(nullable = false)
    private Double task_error_rate;
    
    @Column(nullable = false)
    private Double sleep_hours;
    
    @Column(nullable = false)
    private String risk_label;

    // Constructors
    public Assessment() {
    }

    public Assessment(LocalDateTime timestamp, Integer age, Double reaction_time_ms,
                     Double memory_score, Double speech_pause_ms, Double word_repetition_rate,
                     Double task_error_rate, Double sleep_hours, String risk_label) {
        this.timestamp = timestamp;
        this.age = age;
        this.reaction_time_ms = reaction_time_ms;
        this.memory_score = memory_score;
        this.speech_pause_ms = speech_pause_ms;
        this.word_repetition_rate = word_repetition_rate;
        this.task_error_rate = task_error_rate;
        this.sleep_hours = sleep_hours;
        this.risk_label = risk_label;
    }

    // Getters and Setters
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

    public String getRisk_label() {
        return risk_label;
    }

    public void setRisk_label(String risk_label) {
        this.risk_label = risk_label;
    }
}

