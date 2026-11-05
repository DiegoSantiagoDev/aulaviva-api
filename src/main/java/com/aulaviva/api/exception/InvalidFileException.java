package com.aulaviva.api.exception;

/** Arquivo ausente ou inválido (HTTP 400). */
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }
}
