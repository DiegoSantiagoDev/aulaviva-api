package com.aulaviva.api.service;

import java.nio.file.Path;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.aulaviva.api.ai.SummaryClient;
import com.aulaviva.api.ai.TranscriptionClient;
import com.aulaviva.api.config.AsyncConfig;
import com.aulaviva.api.exception.AiIntegrationException;
import com.aulaviva.api.model.Lesson;
import com.aulaviva.api.model.MediaKind;
import com.aulaviva.api.repository.LessonImageRepository;
import com.aulaviva.api.repository.LessonRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.aulaviva.api.dto.slide.LessonStudyMaterial;

@Service
public class LessonProcessingService {

    private static final Logger log = LoggerFactory.getLogger(LessonProcessingService.class);

    private final LessonRepository lessons;
    private final LessonImageRepository images;
    private final FileStorageService storage;
    private final TranscriptionClient transcriptionClient;
    private final SummaryClient summaryClient;
    private final ObjectMapper objectMapper;

    public LessonProcessingService(
            LessonRepository lessons,
            LessonImageRepository images,
            FileStorageService storage,
            TranscriptionClient transcriptionClient,
            SummaryClient summaryClient,
            ObjectMapper objectMapper) {
        this.lessons = lessons;
        this.images = images;
        this.storage = storage;
        this.transcriptionClient = transcriptionClient;
        this.summaryClient = summaryClient;
        this.objectMapper = objectMapper;
    }

    @Async(AsyncConfig.PROCESSING_EXECUTOR)
    public void process(Long lessonId) {
        Lesson lesson = lessons.findById(lessonId).orElse(null);
        if (lesson == null) {
            log.warn("Aula {} não encontrada para processamento", lessonId);
            return;
        }

        log.info("Processando aula {}", lessonId);
        try {
            Path audio = storage.resolve(MediaKind.AUDIO, lesson.getAudioFileName());
            String transcript = transcriptionClient.transcribe(audio);

            List<Path> boardImages = images.findByLessonIdOrderByIdAsc(lessonId).stream()
                    .map(image -> storage.resolve(MediaKind.IMAGE, image.getFileName()))
                    .toList();

            LessonStudyMaterial material = summaryClient.summarize(
                    lesson.getTitle(), lesson.getSubject(), transcript, boardImages);

            String presentation = objectMapper.writeValueAsString(material.presentation());

            lesson.markDone(transcript, material.summary(), presentation);

            lessons.save(lesson);

            log.info("Aula {} processada com sucesso", lessonId);
        } catch (Exception e) {
            log.error("Falha ao processar a aula {}", lessonId, e);
            lesson.markFailed(userMessage(e));
            lessons.save(lesson);
        }
    }

    private String userMessage(Exception e) {
        if (e instanceof AiIntegrationException) {
            return e.getMessage();
        }
        return "Erro inesperado durante o processamento. Consulte os logs do servidor.";
    }
}
