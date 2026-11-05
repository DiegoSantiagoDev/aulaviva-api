package com.aulaviva.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LessonControllerTest {

    @Autowired
    private MockMvc mvc;

    private int createLesson() throws Exception {
        String body = mvc.perform(post("/api/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Funções\",\"subject\":\"Matemática\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return JsonPath.read(body, "$.id");
    }

    @Test
    void statusEndpointIsOnline() throws Exception {
        mvc.perform(get("/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("online"));
    }

    @Test
    void createsLessonWithCreatedStatus() throws Exception {
        mvc.perform(post("/api/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Funções\",\"subject\":\"Matemática\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.hasAudio").value(false));
    }

    @Test
    void rejectsLessonWithBlankTitle() throws Exception {
        mvc.perform(post("/api/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"subject\":\"Matemática\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsNotFoundForUnknownLesson() throws Exception {
        mvc.perform(get("/api/lessons/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void rejectsUnsupportedAudioFormat() throws Exception {
        int id = createLesson();
        MockMultipartFile txt = new MockMultipartFile(
                "file", "notas.txt", "text/plain", "oi".getBytes(StandardCharsets.UTF_8));

        mvc.perform(multipart("/api/lessons/{id}/audio", id).file(txt))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void acceptsAudioAndStartsProcessing() throws Exception {
        int id = createLesson();
        MockMultipartFile audio = new MockMultipartFile(
                "file", "aula.mp3", "audio/mpeg", "dados-de-audio".getBytes(StandardCharsets.UTF_8));

        mvc.perform(multipart("/api/lessons/{id}/audio", id).file(audio))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("PROCESSING"))
                .andExpect(jsonPath("$.hasAudio").value(true));
    }
}
