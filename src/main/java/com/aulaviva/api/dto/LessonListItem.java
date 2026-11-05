package com.aulaviva.api.dto;

import java.time.Instant;

import com.aulaviva.api.model.LessonStatus;

public record LessonListItem(
        Long id,
        String title,
        String subject,
        LessonStatus status,
        Instant createdAt) {
}
