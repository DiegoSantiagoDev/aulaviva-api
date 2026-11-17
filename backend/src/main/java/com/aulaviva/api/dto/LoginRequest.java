package com.aulaviva.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "é obrigatório") String email,
        @NotBlank(message = "é obrigatório") String password) {
}