package com.aulaviva.api.ai;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.aulaviva.api.config.AiProperties;
import com.aulaviva.api.exception.AiIntegrationException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Component
public class GroqSummaryClient implements SummaryClient {

    private static final Logger log = LoggerFactory.getLogger(GroqSummaryClient.class);

    private static final String SYSTEM_PROMPT = """
            Você é um professor experiente e um assistente de estudos.
            Sua tarefa é produzir um RESUMO DIDÁTICO da aula para um estudante que não pôde assistir.

            Você receberá:
            - a transcrição automática do áudio, que representa o que o professor explicou;
            - até algumas fotos do quadro ou dos slides, que podem conter fórmulas, exemplos,
              esquemas e informações importantes.

            Use a transcrição e as imagens em conjunto. As imagens complementam a explicação oral:
            leia fórmulas, títulos, exemplos e anotações visíveis e relacione-os ao que foi falado.
            Não faça uma simples transcrição, não reproduza a fala inteira e não descreva as imagens
            isoladamente. Explique o conteúdo com suas próprias palavras, preservando o sentido da aula.

            Responda em português do Brasil, com linguagem clara, didática e adequada a estudantes.
            Organize o resultado nestas seções:
            ASSUNTOS PRINCIPAIS
            RESUMO DA AULA
            CONCEITOS E EXEMPLOS IMPORTANTES
            PONTOS PARA REVISAR
            PERGUNTAS DE REVISÃO

            Priorize o que realmente foi explicado. Quando uma imagem estiver ilegível ou a
            transcrição estiver confusa/incompleta, informe a limitação. Não invente conteúdo,
            exemplos, fórmulas ou explicações que não tenham apoio no material recebido.
            """;

    private final RestClient client;
    private final AiProperties properties;

    public GroqSummaryClient(RestClient aiRestClient, AiProperties properties) {
        this.client = aiRestClient;
        this.properties = properties;
    }

    @Override
    public String summarize(String title, String subject, String transcript, List<Path> boardImages) {
        properties.requireApiKey();

        String text = buildUserText(title, subject, transcript);
        List<Path> imagesToSend = boardImages.stream()
                .limit(Math.max(0, properties.maxImages()))
                .toList();

        log.info("Gerando resumo da aula com {} imagem(ns) de apoio", imagesToSend.size());

        // Sem fotos, o conteúdo vai como texto simples; com fotos, usamos conteúdo multimodal.
        Object userContent = text;
        if (!imagesToSend.isEmpty()) {
            List<Object> parts = new ArrayList<>();
            parts.add(Map.of("type", "text", "text", text));
            imagesToSend.forEach(path -> parts.add(imagePart(path)));
            userContent = parts;
        }


        Map<String, Object> systemMessage = Map.of("role", "system", "content", SYSTEM_PROMPT);
        Map<String, Object> userMessage = Map.of("role", "user", "content", userContent);
        Map<String, Object> request = Map.of(
                "model", properties.summaryModel(),
                "temperature", 0.3,
                "messages", List.of(systemMessage, userMessage));

        try {
            ChatResponse response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ChatResponse.class);

            return extractContent(response);
        } catch (RestClientResponseException e) {
            log.error("Resumo recusado pela API: HTTP {} - {}",
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new AiIntegrationException(
                    "A API de resumo recusou a requisição (HTTP "
                            + e.getStatusCode().value() + ").", e);
        } catch (RestClientException e) {
            throw new AiIntegrationException("Não foi possível conectar à API de resumo.", e);
        }
    }

    private String buildUserText(String title, String subject, String transcript) {
        return "Disciplina: " + subject + "\nTítulo da aula: " + title
                + "\n\nTRANSCRIÇÃO:\n" + transcript;
    }

    private Map<String, Object> imagePart(Path path) {
        try {
            byte[] bytes = Files.readAllBytes(path);
            String mimeType = MediaTypeFactory.getMediaType(path.getFileName().toString())
                    .map(MediaType::toString)
                    .orElse("image/jpeg");
            String dataUrl = "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(bytes);
            return Map.of("type", "image_url", "image_url", Map.of("url", dataUrl));
        } catch (IOException e) {
            throw new AiIntegrationException("Não foi possível ler uma das fotos do quadro.", e);
        }
    }

    private String extractContent(ChatResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()
                || response.choices().get(0).message() == null
                || response.choices().get(0).message().content() == null
                || response.choices().get(0).message().content().isBlank()) {
            throw new AiIntegrationException("A API de resumo devolveu uma resposta vazia.");
        }
        return response.choices().get(0).message().content().trim();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ChatResponse(List<Choice> choices) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Message(String content) {
    }
}
