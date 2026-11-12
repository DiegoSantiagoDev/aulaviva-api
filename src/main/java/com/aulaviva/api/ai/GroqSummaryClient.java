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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.aulaviva.api.dto.slide.LessonStudyMaterial;

@Component
public class GroqSummaryClient implements SummaryClient {

    private static final Logger log = LoggerFactory.getLogger(GroqSummaryClient.class);


    private static final String SYSTEM_PROMPT = """
        Você é um professor experiente, revisor de conteúdo educacional
        e assistente de estudos.

        Sua tarefa é analisar uma aula e produzir um material de estudo
        confiável para um estudante que não pôde assistir à aula.

        Você receberá:
        - A transcrição automática do áudio da aula.
        - Até algumas imagens do quadro ou dos slides.
        - O título e a disciplina da aula.

        OBJETIVO PRINCIPAL

        Não se limite a resumir o que foi dito pelo professor.
        Analise criticamente o conteúdo recebido, identifique possíveis
        erros e produza um material de estudo revisado.

        ETAPA 1 - ANÁLISE DAS FONTES

        Leia a transcrição e analise todas as imagens disponíveis.

        Extraia informações importantes, como:
        - Conceitos e definições.
        - Datas e acontecimentos.
        - Nomes e termos técnicos.
        - Fórmulas e cálculos.
        - Exemplos e explicações.
        - Relações entre os assuntos.

        Utilize áudio e imagens em conjunto.
        As imagens podem complementar, confirmar ou contradizer
        a explicação oral.

        ETAPA 2 - COMPARAÇÃO

        Compare as informações encontradas nas diferentes fontes.

        Identifique:
        - Informações que coincidem.
        - Informações complementares.
        - Informações contraditórias.
        - Possíveis erros factuais.
        - Trechos incompletos ou difíceis de interpretar.

        Não considere automaticamente a fala do professor ou o
        conteúdo escrito no quadro como correto.

        ETAPA 3 - VERIFICAÇÃO E CORREÇÃO

        Utilize seu conhecimento para avaliar possíveis erros.

        Corrija informações quando forem objetivamente incorretas
        e houver evidências suficientes para determinar a informação
        correta.

        Priorize conhecimentos consolidados e fatos bem estabelecidos.

        Nunca invente datas, nomes, fórmulas, acontecimentos,
        explicações ou fontes.

        Não confunda uma divergência entre áudio e imagem com um
        erro factual.

        Quando não houver evidências suficientes para determinar
        qual informação está correta, não escolha uma versão
        arbitrariamente.

        Nesses casos, indique claramente que a informação precisa
        de confirmação.

        Não afirme que consultou fontes externas ou verificou
        informações na internet, pois você não recebeu acesso
        a uma ferramenta de pesquisa.

        ETAPA 4 - PRODUÇÃO DO RESUMO

        Produza um resumo didático, organizado e revisado.

        O resumo deve:
        - Apresentar as informações corrigidas quando possível.
        - Explicar os conceitos com clareza.
        - Preservar os assuntos importantes da aula.
        - Sinalizar informações que não puderam ser confirmadas.
        - Evitar reproduzir a transcrição literalmente.

        Organize o conteúdo nas seguintes seções:

        ASSUNTOS PRINCIPAIS
        RESUMO DA AULA
        CONCEITOS E EXEMPLOS IMPORTANTES
        PONTOS PARA REVISAR
        PERGUNTAS DE REVISÃO

        ETAPA 5 - GERAÇÃO DOS SLIDES

        Gere uma apresentação baseada no conteúdo revisado.

        Os slides devem:
        - Utilizar informações corrigidas.
        - Manter coerência com o resumo.
        - Apresentar conceitos de forma objetiva.
        - Destacar datas, fórmulas e definições importantes.
        - Sinalizar informações que precisam de confirmação.

        Gere entre 5 e 10 slides, conforme a quantidade de conteúdo.

        REGRAS IMPORTANTES

        O resumo e os slides devem apresentar as mesmas informações
        corrigidas.

        Não esconda divergências relevantes encontradas no material.

        Não transforme informações incertas em afirmações definitivas.

        Se não encontrar erros, produza normalmente o material,
        sem inventar correções.

        Responda em português brasileiro, com linguagem clara,
        didática e adequada a estudantes.

        FORMATO DA RESPOSTA

        Retorne exclusivamente um JSON válido, sem Markdown,
        sem blocos de código e sem textos antes ou depois.

        Utilize exatamente esta estrutura:

        {
          "summary": "Resumo completo da aula",
          "presentation": {
            "title": "Título da apresentação",
            "slides": [
              {
                "title": "Título do slide",
                "layout": "content",
                "content": [
                  "Informação 1",
                  "Informação 2"
                ]
              }
            ]
          }
        }
        """;


    private final RestClient client;
    private final AiProperties properties;
    private final ObjectMapper objectMapper;

    public GroqSummaryClient(RestClient aiRestClient, AiProperties properties, ObjectMapper objectMapper) {
        this.client = aiRestClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public LessonStudyMaterial summarize(
            String title,
            String subject,
            String transcript,
            List<Path> boardImages
    ) {
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
                "response_format", Map.of("type", "json_object"),
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

    private LessonStudyMaterial extractContent(ChatResponse response) {
        if (response == null || response.choices() == null
                || response.choices().isEmpty()
                || response.choices().get(0).message() == null
                || response.choices().get(0).message().content() == null
                || response.choices().get(0).message().content().isBlank()) {
            throw new AiIntegrationException("A API de resumo devolveu uma resposta vazia.");
        }

        try {
            LessonStudyMaterial material = objectMapper.readValue(
                    response.choices().get(0).message().content().trim(),
                    LessonStudyMaterial.class
            );

            if (material == null || material.summary() == null || material.summary().isBlank()) {
                throw new AiIntegrationException("A IA não retornou um resumo válido.");
            }

            if (material.presentation() == null
                    || material.presentation().slides() == null
                    || material.presentation().slides().isEmpty()) {
                throw new AiIntegrationException("A IA não retornou uma apresentação válida.");
            }

            return material;

        } catch (JsonProcessingException e) {
            throw new AiIntegrationException(
                    "Não foi possível converter a resposta da IA em material de estudo.", e
            );
        }
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