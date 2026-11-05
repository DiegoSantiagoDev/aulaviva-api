package com.aulaviva.api.exception;

/** Operação incompatível com o estado atual da aula (HTTP 409). */
public class InvalidStateException extends RuntimeException {

    public InvalidStateException(String message) {
        super(message);
    }
}
