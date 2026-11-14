package com.aulaviva.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aulaviva.storage")
public record StorageProperties(String audioDir, String imageDir) {
}
