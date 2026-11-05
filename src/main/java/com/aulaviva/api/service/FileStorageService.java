package com.aulaviva.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aulaviva.api.config.StorageProperties;
import com.aulaviva.api.exception.InvalidFileException;
import com.aulaviva.api.exception.StorageException;
import com.aulaviva.api.exception.UnsupportedFormatException;
import com.aulaviva.api.model.MediaKind;

/**
 * Valida e grava arquivos enviados (áudios e imagens) no disco.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Map<MediaKind, Path> directories = new EnumMap<>(MediaKind.class);

    public FileStorageService(StorageProperties properties) {
        directories.put(MediaKind.AUDIO, prepareDirectory(properties.audioDir()));
        directories.put(MediaKind.IMAGE, prepareDirectory(properties.imageDir()));
    }

    /**
     * Grava o arquivo com um nome gerado pelo servidor e devolve esse nome.
     * O nome enviado pelo cliente nunca é usado no disco.
     */
    public String store(MultipartFile file, MediaKind kind) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("O arquivo enviado está vazio.");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (!kind.allows(extension)) {
            throw new UnsupportedFormatException(
                    "Formato não permitido. Use: " + describeExtensions(kind));
        }

        String storedName = UUID.randomUUID() + extension;
        try {
            file.transferTo(resolve(kind, storedName));
        } catch (IOException e) {
            throw new StorageException("Falha ao gravar o arquivo " + storedName, e);
        }

        log.info("Arquivo salvo: tipo={} nome={} tamanho={} bytes", kind, storedName, file.getSize());
        return storedName;
    }

    /**
     * Resolve o caminho de um arquivo já salvo, impedindo que o nome escape da pasta.
     */
    public Path resolve(MediaKind kind, String storedName) {
        Path directory = directories.get(kind);
        Path path = directory.resolve(storedName).normalize();
        if (!path.startsWith(directory)) {
            throw new StorageException("Caminho de arquivo inválido.");
        }
        return path;
    }

    /**
     * Remove um arquivo sem falhar caso ele não exista ou não possa ser apagado.
     */
    public void deleteQuietly(MediaKind kind, String storedName) {
        if (storedName == null) {
            return;
        }
        try {
            Files.deleteIfExists(resolve(kind, storedName));
        } catch (IOException | StorageException e) {
            log.warn("Não foi possível apagar o arquivo {}", storedName, e);
        }
    }

    private Path prepareDirectory(String configuredPath) {
        Path directory = Path.of(configuredPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(directory);
        } catch (IOException e) {
            throw new StorageException("Não foi possível criar a pasta " + directory, e);
        }
        return directory;
    }

    private String extractExtension(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            return "";
        }
        return originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
    }

    private String describeExtensions(MediaKind kind) {
        return kind.extensions().stream().sorted().collect(Collectors.joining(", "));
    }
}
