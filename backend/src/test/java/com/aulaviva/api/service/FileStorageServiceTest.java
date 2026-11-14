package com.aulaviva.api.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import com.aulaviva.api.config.StorageProperties;
import com.aulaviva.api.exception.InvalidFileException;
import com.aulaviva.api.exception.StorageException;
import com.aulaviva.api.exception.UnsupportedFormatException;
import com.aulaviva.api.model.MediaKind;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService service;

    @BeforeEach
    void setUp() {
        service = new FileStorageService(new StorageProperties(
                tempDir.resolve("audio").toString(),
                tempDir.resolve("images").toString()));
    }

    private MockMultipartFile file(String name, String content) {
        return new MockMultipartFile("file", name, "application/octet-stream",
                content.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void storesValidAudioWithGeneratedName() {
        String storedName = service.store(file("Aula.MP3", "conteudo"), MediaKind.AUDIO);

        assertTrue(storedName.endsWith(".mp3"));
        assertTrue(Files.exists(service.resolve(MediaKind.AUDIO, storedName)));
    }

    @Test
    void rejectsEmptyFile() {
        assertThrows(InvalidFileException.class,
                () -> service.store(file("aula.mp3", ""), MediaKind.AUDIO));
    }

    @Test
    void rejectsUnsupportedExtension() {
        assertThrows(UnsupportedFormatException.class,
                () -> service.store(file("notas.txt", "oi"), MediaKind.AUDIO));
    }

    @Test
    void rejectsAudioExtensionInImageUpload() {
        assertThrows(UnsupportedFormatException.class,
                () -> service.store(file("aula.mp3", "oi"), MediaKind.IMAGE));
    }

    @Test
    void resolveBlocksPathTraversal() {
        assertThrows(StorageException.class,
                () -> service.resolve(MediaKind.AUDIO, "../fora.mp3"));
    }
}
