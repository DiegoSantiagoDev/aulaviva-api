package com.aulaviva.api.ai;

import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

@Component
public class AiRetry {

    private static final Logger log = LoggerFactory.getLogger(AiRetry.class);

    private static final int MAX_ATTEMPTS = 3;
    private static final long[] BACKOFF_MILLIS = {2_000, 5_000};
    private static final long MAX_WAIT_MILLIS = 30_000;

    public <T> T execute(String operation, Supplier<T> call) {
        for (int attempt = 1; ; attempt++) {
            try {
                return call.get();
            } catch (RuntimeException e) {
                if (attempt >= MAX_ATTEMPTS || !isTransient(e)) {
                    throw e;
                }
                long wait = waitMillis(e, attempt);
                log.warn("Falha temporária em {} (tentativa {} de {}): {}. Nova tentativa em {} ms.",
                        operation, attempt, MAX_ATTEMPTS, e.getMessage(), wait);
                pause(wait);
            }
        }
    }

    protected void pause(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Espera interrompida durante a retentativa.", e);
        }
    }

    private static boolean isTransient(RuntimeException e) {
        if (e instanceof RestClientResponseException response) {
            int status = response.getStatusCode().value();
            return status == 429 || status >= 500;
        }
        return e instanceof ResourceAccessException;
    }

    private static long waitMillis(RuntimeException e, int attempt) {
        long wait = BACKOFF_MILLIS[attempt - 1];
        if (e instanceof RestClientResponseException response
                && response.getResponseHeaders() != null) {
            String header = response.getResponseHeaders().getFirst("Retry-After");
            if (header != null) {
                try {
                    wait = Math.max(wait, Long.parseLong(header.trim()) * 1000);
                } catch (NumberFormatException ignored) {
                    // cabeçalho em formato de data: mantém a espera padrão
                }
            }
        }
        return Math.min(wait, MAX_WAIT_MILLIS);
    }
}