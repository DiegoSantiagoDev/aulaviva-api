package com.aulaviva.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Pastas onde os arquivos enviados são gravados (propriedades "aulaviva.storage.*").
 */
@ConfigurationProperties(prefix = "aulaviva.storage")
public record StorageProperties(String audioDir, String imageDir) {
}
