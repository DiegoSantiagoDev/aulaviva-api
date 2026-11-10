package com.aulaviva.api.dto;

import java.time.Instant;
import java.util.List;

import com.aulaviva.api.model.LessonStatus;
import com.aulaviva.api.dto.slide.SlidePresentation;

public record LessonResponse(
        Long id,
        String title,
        String subject,
        LessonStatus status,
        boolean hasAudio,
        String summary,
        SlidePresentation presentation,
        String failureReason,
        List<ImageResponse> images,
        Instant createdAt
) {
}
