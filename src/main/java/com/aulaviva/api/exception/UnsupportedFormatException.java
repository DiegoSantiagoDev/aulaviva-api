package com.aulaviva.api.exception;

/** Formato de arquivo não permitido (HTTP 415). */
public class UnsupportedFormatException extends RuntimeException {

    public UnsupportedFormatException(String message) {
        super(message);
    }
}
