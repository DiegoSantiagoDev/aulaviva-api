package com.aulaviva.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLessonRequest(
        @NotBlank(message = "é obrigatório")
        @Size(max = 150, message = "deve ter no máximo 150 caracteres")
        String title,

        @NotBlank(message = "é obrigatório")
        @Size(max = 80, message = "deve ter no máximo 80 caracteres")
        String subject) {
}
