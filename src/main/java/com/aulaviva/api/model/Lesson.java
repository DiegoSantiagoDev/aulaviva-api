package com.aulaviva.api.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "lessons")
public class Lesson {

    private static final int MAX_FAILURE_LENGTH = 500;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 80)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LessonStatus status = LessonStatus.CREATED;

    @Column(length = 100)
    private String audioFileName;

    @Column(length = 255)
    private String audioOriginalName;

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(length = MAX_FAILURE_LENGTH)
    private String failureReason;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Lesson() {
    }

    public Lesson(String title, String subject) {
        this.title = title;
        this.subject = subject;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void attachAudio(String storedName, String originalName) {
        this.audioFileName = storedName;
        this.audioOriginalName = originalName;
        restartProcessing();
    }

    public void restartProcessing() {
        this.transcript = null;
        this.summary = null;
        this.failureReason = null;
        this.status = LessonStatus.PROCESSING;
    }

    public void markDone(String transcript, String summary) {
        this.transcript = transcript;
        this.summary = summary;
        this.failureReason = null;
        this.status = LessonStatus.DONE;
    }

    public void markFailed(String reason) {
        String safeReason = reason == null ? "Falha desconhecida." : reason;
        if (safeReason.length() > MAX_FAILURE_LENGTH) {
            safeReason = safeReason.substring(0, MAX_FAILURE_LENGTH);
        }
        this.failureReason = safeReason;
        this.status = LessonStatus.FAILED;
    }

    // ---- getters ----

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSubject() {
        return subject;
    }

    public LessonStatus getStatus() {
        return status;
    }

    public String getAudioFileName() {
        return audioFileName;
    }

    public String getAudioOriginalName() {
        return audioOriginalName;
    }

    public String getTranscript() {
        return transcript;
    }

    public String getSummary() {
        return summary;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
