package com.aulaviva.api.mapper;

import java.util.List;

import com.aulaviva.api.dto.ImageResponse;
import com.aulaviva.api.dto.LessonListItem;
import com.aulaviva.api.dto.LessonResponse;
import com.aulaviva.api.model.Lesson;
import com.aulaviva.api.model.LessonImage;

/**
 * Converte entidades em DTOs. Mantém o formato da API separado do modelo do banco.
 */
public final class LessonMapper {

    private LessonMapper() {
    }

    public static LessonResponse toResponse(Lesson lesson, List<LessonImage> images) {
        List<ImageResponse> imageResponses = images.stream()
                .map(image -> toImageResponse(lesson.getId(), image))
                .toList();

        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getSubject(),
                lesson.getStatus(),
                lesson.getAudioFileName() != null,
                lesson.getSummary(),
                lesson.getFailureReason(),
                imageResponses,
                lesson.getCreatedAt());
    }

    public static LessonListItem toListItem(Lesson lesson) {
        return new LessonListItem(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getSubject(),
                lesson.getStatus(),
                lesson.getCreatedAt());
    }

    public static ImageResponse toImageResponse(Long lessonId, LessonImage image) {
        return new ImageResponse(
                image.getId(),
                image.getOriginalName(),
                "/api/lessons/" + lessonId + "/images/" + image.getId());
    }
}
