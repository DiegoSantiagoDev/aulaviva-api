package com.aulaviva.api.dto;

import java.time.Instant;

public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        String role,
        String status,
        Instant createdAt) {
}