package com.aulaviva.api.dto;

import java.time.Instant;
import java.util.List;

import com.aulaviva.api.model.LessonStatus;

public record LessonResponse(
        Long id,
        String title,
        String subject,
        LessonStatus status,
        boolean hasAudio,
        String summary,
        String failureReason,
        List<ImageResponse> images,
        Instant createdAt) {
}
