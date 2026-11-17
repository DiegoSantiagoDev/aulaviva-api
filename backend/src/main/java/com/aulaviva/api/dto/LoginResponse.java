package com.aulaviva.api.dto;

import java.time.Instant;

public record LoginResponse(
        String token,
        Instant expiresAt,
        String name,
        String role) {
}