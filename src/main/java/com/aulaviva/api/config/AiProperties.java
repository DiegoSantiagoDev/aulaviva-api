package com.aulaviva.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import com.aulaviva.api.exception.AiIntegrationException;

/**
 * Configuração da integração com a API de IA (propriedades "aulaviva.ai.*").
 */
@ConfigurationProperties(prefix = "aulaviva.ai")
public record AiProperties(
        String apiKey,
        String baseUrl,
        String transcriptionModel,
        String summaryModel,
        String language,
        int maxImages) {

    /**
     * Garante que a chave existe antes de qualquer chamada externa.
     */
    public void requireApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiIntegrationException(
                    "Chave da API de IA não configurada (variável de ambiente AI_API_KEY).");
        }
    }
}
