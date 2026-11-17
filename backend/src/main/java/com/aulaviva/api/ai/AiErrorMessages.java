package com.aulaviva.api.ai;

final class AiErrorMessages {

    private AiErrorMessages() {
    }

    static String forStatus(int status, String service) {
        if (status == 401 || status == 403) {
            return "A chave da API de IA foi recusada. Verifique a configuração da AI_API_KEY.";
        }
        if (status == 429) {
            return "O limite de uso da API de IA foi atingido. Tente reprocessar em alguns minutos.";
        }
        if (status >= 500) {
            return "A API de IA está indisponível no momento. Tente reprocessar em instantes.";
        }
        return "A API de " + service + " recusou a requisição (HTTP " + status + ").";
    }
}