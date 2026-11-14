package com.aulaviva.api.ai;

import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.aulaviva.api.config.AiProperties;
import com.aulaviva.api.exception.AiIntegrationException;

@Component
public class GroqTranscriptionClient implements TranscriptionClient {

    private static final Logger log = LoggerFactory.getLogger(GroqTranscriptionClient.class);

    private final RestClient client;
    private final AiProperties properties;

    public GroqTranscriptionClient(RestClient aiRestClient, AiProperties properties) {
        this.client = aiRestClient;
        this.properties = properties;
    }

    @Override
    public String transcribe(Path audioFile) {
        properties.requireApiKey();

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(audioFile));
        body.add("model", properties.transcriptionModel());
        body.add("language", properties.language());
        body.add("response_format", "text");

        try {
            String text = client.post()
                    .uri("/audio/transcriptions")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            if (text == null || text.isBlank()) {
                throw new AiIntegrationException(
                        "A transcrição veio vazia. Verifique se o áudio contém fala.");
            }
            return text.trim();
        } catch (RestClientResponseException e) {
            log.error("Transcrição recusada pela API: HTTP {} - {}",
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new AiIntegrationException(
                    "A API de transcrição recusou a requisição (HTTP "
                            + e.getStatusCode().value() + ").", e);
        } catch (RestClientException e) {
            throw new AiIntegrationException(
                    "Não foi possível conectar à API de transcrição.", e);
        }
    }
}
