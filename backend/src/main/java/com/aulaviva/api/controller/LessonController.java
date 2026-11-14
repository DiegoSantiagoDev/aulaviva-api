package com.aulaviva.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aulaviva.api.dto.CreateLessonRequest;
import com.aulaviva.api.dto.ImageResponse;
import com.aulaviva.api.dto.LessonListItem;
import com.aulaviva.api.dto.LessonResponse;
import com.aulaviva.api.service.LessonService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService service;

    public LessonController(LessonService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(@Valid @RequestBody CreateLessonRequest request) {
        LessonResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/lessons/" + created.id())).body(created);
    }

    @GetMapping
    public List<LessonListItem> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public LessonResponse get(@PathVariable("id") Long id) {
        return service.get(id);
    }

    @PostMapping(value = "/{id}/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LessonResponse> uploadAudio(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(service.uploadAudio(id, file));
    }

    @PostMapping("/{id}/reprocess")
    public ResponseEntity<LessonResponse> reprocess(@PathVariable("id") Long id) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(service.reprocess(id));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageResponse> addImage(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addImage(id, file));
    }

    @GetMapping("/{id}/images/{imageId}")
    public ResponseEntity<Resource> getImage(
            @PathVariable("id") Long id,
            @PathVariable("imageId") Long imageId) {
        Resource image = service.loadImage(id, imageId);
        MediaType type = MediaTypeFactory.getMediaType(image)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(type)
                .cacheControl(CacheControl.noCache())
                .header("X-Content-Type-Options", "nosniff")
                .body(image);
    }
}
