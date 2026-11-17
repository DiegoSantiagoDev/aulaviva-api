package com.aulaviva.api.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import com.aulaviva.api.dto.slide.SlidePresentation;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

@Service
public class LessonService {

    private static final Logger log = LoggerFactory.getLogger(LessonService.class);
    private static final int MAX_IMAGES = 3;

    private final LessonRepository lessons;
    private final LessonImageRepository images;
    private final FileStorageService storage;
    private final LessonProcessingService processing;
    private final ObjectMapper objectMapper;

    public LessonService(
            LessonRepository lessons,
            LessonImageRepository images,
            FileStorageService storage,
            LessonProcessingService processing,
            ObjectMapper objectMapper) {
        this.lessons = lessons;
        this.images = images;
        this.storage = storage;
        this.processing = processing;
        this.objectMapper = objectMapper;
    }

    public LessonResponse create(CreateLessonRequest request) {
        Lesson lesson = lessons.save(new Lesson(request.title().trim(), request.subject().trim()));
        return toResponse(lesson);
    }

    public List<LessonListItem> list() {
        Set<Long> lessonIdsWithImages = images.findLessonIdsWithImages();

        return lessons.findAllByOrderByCreatedAtDesc().stream()
                .map(lesson -> LessonMapper.toListItem(
                        lesson,
                        lessonIdsWithImages.contains(lesson.getId())))
                .toList();
    }

    public LessonResponse get(Long id, boolean staff) {
        return toResponse(findVisibleLesson(id, staff));
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
        ensureNotProcessing(lesson);
        if (images.countByLessonId(id) >= MAX_IMAGES) {
            throw new InvalidStateException(
                    "Cada aula aceita no máximo " + MAX_IMAGES + " fotos do quadro.");
        }

        String storedName = storage.store(file, MediaKind.IMAGE);
        LessonImage image = images.save(
                new LessonImage(lesson, storedName, file.getOriginalFilename()));
        return LessonMapper.toImageResponse(lesson.getId(), image);
    }

    @Transactional
    public void delete(Long id) {
        Lesson lesson = findLesson(id);
        ensureNotProcessing(lesson);

        List<LessonImage> lessonImages = images.findByLessonIdOrderByIdAsc(id);
        String audioFileName = lesson.getAudioFileName();

        images.deleteAll(lessonImages);
        lessons.delete(lesson);

        storage.deleteQuietly(MediaKind.AUDIO, audioFileName);
        lessonImages.forEach(image ->
                storage.deleteQuietly(MediaKind.IMAGE, image.getFileName()));
    }

    @Transactional
    public void deleteImage(Long lessonId, Long imageId) {
        Lesson lesson = findLesson(lessonId);
        ensureNotProcessing(lesson);

        LessonImage image = images.findByIdAndLessonId(imageId, lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem não encontrada."));

        images.delete(image);
        storage.deleteQuietly(MediaKind.IMAGE, image.getFileName());
    }

    public Resource loadImage(Long lessonId, Long imageId, boolean staff) {
        findVisibleLesson(lessonId, staff);

        LessonImage image = images.findByIdAndLessonId(imageId, lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem não encontrada."));

        Path path = storage.resolve(MediaKind.IMAGE, image.getFileName());
        if (!Files.isReadable(path)) {
            throw new ResourceNotFoundException("O arquivo da imagem não foi encontrado.");
        }
        return new FileSystemResource(path);
    }

    public List<LessonListItem> list(boolean staff) {
        Set<Long> lessonIdsWithImages = images.findLessonIdsWithImages();

        return lessons.findAllByOrderByCreatedAtDesc().stream()
                .filter(lesson -> staff || lesson.getStatus() == LessonStatus.DONE)
                .map(lesson -> LessonMapper.toListItem(
                        lesson,
                        lessonIdsWithImages.contains(lesson.getId())))
                .toList();
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
        SlidePresentation presentation = parsePresentation(lesson.getPresentation());

        return LessonMapper.toResponse(
                lesson,
                images.findByLessonIdOrderByIdAsc(lesson.getId()),
                presentation
        );
    }

    private SlidePresentation parsePresentation(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, SlidePresentation.class);

        } catch (JsonProcessingException e) {
            log.warn("Apresentação salva em formato inválido; será ignorada.", e);
            return null;
        }
    }

    private Lesson findVisibleLesson(Long id, boolean staff) {

        Lesson lesson = findLesson(id);

        if (!staff && lesson.getStatus() != LessonStatus.DONE) {
            throw new ResourceNotFoundException("Aula não encontrada: " + id);
        }
        return lesson;
    }
}
