package com.aulaviva.api.ai;

import java.nio.file.Path;
import java.util.List;

import com.aulaviva.api.dto.slide.LessonStudyMaterial;

public interface SummaryClient {
    LessonStudyMaterial summarize(
            String title,
            String subject,
            String transcript,
            List<Path> boardImages
    );
}
