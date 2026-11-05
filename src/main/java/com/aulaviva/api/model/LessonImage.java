package com.aulaviva.api.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "lesson_images")
public class LessonImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false, length = 100)
    private String fileName;

    @Column(length = 255)
    private String originalName;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    /** Exigido pelo JPA. */
    protected LessonImage() {
    }

    public LessonImage(Lesson lesson, String fileName, String originalName) {
        this.lesson = lesson;
        this.fileName = fileName;
        this.originalName = originalName;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public String getFileName() {
        return fileName;
    }

    public String getOriginalName() {
        return originalName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
