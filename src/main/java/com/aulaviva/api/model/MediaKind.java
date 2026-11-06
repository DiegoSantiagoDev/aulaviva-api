package com.aulaviva.api.model;

import java.util.Set;

public enum MediaKind {
    AUDIO(Set.of(".mp3", ".wav", ".m4a", ".ogg", ".webm")),
    IMAGE(Set.of(".jpg", ".jpeg", ".png", ".webp"));

    private final Set<String> extensions;

    MediaKind(Set<String> extensions) {
        this.extensions = extensions;
    }

    public boolean allows(String extension) {
        return extensions.contains(extension);
    }

    public Set<String> extensions() {
        return extensions;
    }
}
