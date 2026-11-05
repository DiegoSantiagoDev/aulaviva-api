package com.aulaviva.api.model;

public enum LessonStatus {
    /** Aula criada, ainda sem áudio. */
    CREATED,
    /** Áudio recebido; transcrição e resumo em andamento. */
    PROCESSING,
    /** Transcrição e resumo prontos. */
    DONE,
    /** O processamento falhou; veja o motivo em failureReason. */
    FAILED
}
