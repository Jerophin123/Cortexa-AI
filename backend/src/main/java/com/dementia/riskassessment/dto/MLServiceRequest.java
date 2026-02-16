package com.dementia.riskassessment.dto;

public class MLServiceRequest {
    private Integer age;
    private Double reaction_time_ms;
    private Double memory_score;
    private Double speech_pause_ms;
    private Double word_repetition_rate;
    private Double task_error_rate;
    private Double sleep_hours;

    public MLServiceRequest() {
    }

    public MLServiceRequest(Integer age, Double reaction_time_ms, Double memory_score,
                           Double speech_pause_ms, Double word_repetition_rate,
                           Double task_error_rate, Double sleep_hours) {
        this.age = age;
        this.reaction_time_ms = reaction_time_ms;
        this.memory_score = memory_score;
        this.speech_pause_ms = speech_pause_ms;
        this.word_repetition_rate = word_repetition_rate;
        this.task_error_rate = task_error_rate;
        this.sleep_hours = sleep_hours;
    }

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
}






