package com.aulaviva.api.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClientResponseException;

class AiRetryTest {

    private final AiRetry retry = new AiRetry() {
        @Override
        protected void pause(long millis) {
            // sem espera nos testes
        }
    };

    private static RestClientResponseException http(int status) {
        return new RestClientResponseException("erro", status, "erro", null, null, null);
    }

    @Test
    void retriesTransientErrorAndSucceeds() {
        AtomicInteger attempts = new AtomicInteger();

        String result = retry.execute("teste", () -> {
            if (attempts.incrementAndGet() < 3) {
                throw http(503);
            }
            return "ok";
        });

        assertEquals("ok", result);
        assertEquals(3, attempts.get());
    }

    @Test
    void doesNotRetryPermanentError() {
        AtomicInteger attempts = new AtomicInteger();

        assertThrows(RestClientResponseException.class, () -> retry.execute("teste", () -> {
            attempts.incrementAndGet();
            throw http(401);
        }));

        assertEquals(1, attempts.get());
    }

    @Test
    void givesUpAfterThreeAttempts() {
        AtomicInteger attempts = new AtomicInteger();

        assertThrows(RestClientResponseException.class, () -> retry.execute("teste", () -> {
            attempts.incrementAndGet();
            throw http(429);
        }));

        assertEquals(3, attempts.get());
    }
}