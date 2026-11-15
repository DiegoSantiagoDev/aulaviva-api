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
        byte[] mp3 = {'I', 'D', '3', 4, 0, 0, 0, 0, 0, 0};
        MockMultipartFile audio = new MockMultipartFile(
                "file", "Aula.MP3", "audio/mpeg", mp3);

        String storedName = service.store(audio, MediaKind.AUDIO);

        assertTrue(storedName.endsWith(".mp3"));
        assertTrue(Files.exists(service.resolve(MediaKind.AUDIO, storedName)));
    }

    @Test
    void storesValidPng() {
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
        MockMultipartFile image = new MockMultipartFile(
                "file", "quadro.png", "image/png", png);

        String storedName = service.store(image, MediaKind.IMAGE);

        assertTrue(storedName.endsWith(".png"));
    }

    @Test
    void rejectsFileWhoseContentDoesNotMatchExtension() {
        assertThrows(InvalidFileException.class,
                () -> service.store(file("falso.mp3", "isto nao e um audio"), MediaKind.AUDIO));
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
