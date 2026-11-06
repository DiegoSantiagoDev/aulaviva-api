package com.aulaviva.api.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aulaviva.api.dto.CreateLessonRequest;
import com.aulaviva.api.dto.ImageResponse;
import com.aulaviva.api.dto.LessonListItem;
import com.aulaviva.api.dto.LessonResponse;
import com.aulaviva.api.exception.InvalidStateException;
import com.aulaviva.api.exception.ResourceNotFoundException;
import com.aulaviva.api.mapper.LessonMapper;
import com.aulaviva.api.model.Lesson;
import com.aulaviva.api.model.LessonImage;
import com.aulaviva.api.model.LessonStatus;
import com.aulaviva.api.model.MediaKind;
import com.aulaviva.api.repository.LessonImageRepository;
import com.aulaviva.api.repository.LessonRepository;

@Service
public class LessonService {

    private static final Logger log = LoggerFactory.getLogger(LessonService.class);

    private final LessonRepository lessons;
    private final LessonImageRepository images;
    private final FileStorageService storage;
    private final LessonProcessingService processing;

    public LessonService(
            LessonRepository lessons,
            LessonImageRepository images,
            FileStorageService storage,
            LessonProcessingService processing) {
        this.lessons = lessons;
        this.images = images;
        this.storage = storage;
        this.processing = processing;
    }

    public LessonResponse create(CreateLessonRequest request) {
        Lesson lesson = lessons.save(new Lesson(request.title().trim(), request.subject().trim()));
        return toResponse(lesson);
    }

    public List<LessonListItem> list() {
        return lessons.findAllByOrderByCreatedAtDesc().stream()
                .map(LessonMapper::toListItem)
                .toList();
    }

    public LessonResponse get(Long id) {
        return toResponse(findLesson(id));
    }

    public LessonResponse uploadAudio(Long id, MultipartFile file) {
        Lesson lesson = findLesson(id);
        ensureNotProcessing(lesson);

        String previousAudio = lesson.getAudioFileName();
        String storedName = storage.store(file, MediaKind.AUDIO);

        lesson.attachAudio(storedName, file.getOriginalFilename());
        lessons.save(lesson);
        storage.deleteQuietly(MediaKind.AUDIO, previousAudio);

        dispatchProcessing(lesson);
        return toResponse(lesson);
    }

    public LessonResponse reprocess(Long id) {
        Lesson lesson = findLesson(id);
        ensureNotProcessing(lesson);
        if (lesson.getAudioFileName() == null) {
            throw new InvalidStateException("A aula ainda não tem áudio para processar.");
        }

        lesson.restartProcessing();
        lessons.save(lesson);

        dispatchProcessing(lesson);
        return toResponse(lesson);
    }

    public ImageResponse addImage(Long id, MultipartFile file) {
        Lesson lesson = findLesson(id);
        String storedName = storage.store(file, MediaKind.IMAGE);
        LessonImage image = images.save(
                new LessonImage(lesson, storedName, file.getOriginalFilename()));
        return LessonMapper.toImageResponse(lesson.getId(), image);
    }

    public Resource loadImage(Long lessonId, Long imageId) {
        LessonImage image = images.findByIdAndLessonId(imageId, lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem não encontrada."));

        Path path = storage.resolve(MediaKind.IMAGE, image.getFileName());
        if (!Files.isReadable(path)) {
            throw new ResourceNotFoundException("O arquivo da imagem não foi encontrado.");
        }
        return new FileSystemResource(path);
    }

    // ---- métodos auxiliares ----

    private Lesson findLesson(Long id) {
        return lessons.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aula não encontrada: " + id));
    }

    private void ensureNotProcessing(Lesson lesson) {
        if (lesson.getStatus() == LessonStatus.PROCESSING) {
            throw new InvalidStateException("A aula já está sendo processada. Aguarde o término.");
        }
    }

    private void dispatchProcessing(Lesson lesson) {
        try {
            processing.process(lesson.getId());
        } catch (TaskRejectedException e) {
            log.error("Fila de processamento cheia; aula {} não foi enfileirada", lesson.getId(), e);
            lesson.markFailed("Fila de processamento cheia. Tente reprocessar em instantes.");
            lessons.save(lesson);
        }
    }

    private LessonResponse toResponse(Lesson lesson) {
        return LessonMapper.toResponse(lesson, images.findByLessonIdOrderByIdAsc(lesson.getId()));
    }
}
