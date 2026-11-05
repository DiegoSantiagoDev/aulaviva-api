package com.aulaviva.api.exception;

/**
 * Falha na integração com a API de IA. A mensagem é segura para ser exibida ao usuário
 * (não contém chaves nem detalhes internos).
 */
public class AiIntegrationException extends RuntimeException {

    public AiIntegrationException(String message) {
        super(message);
    }

    public AiIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
