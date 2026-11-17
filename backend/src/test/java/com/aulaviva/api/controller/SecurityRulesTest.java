package com.aulaviva.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityRulesTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void anonymousCannotCreateLesson() throws Exception {
        mvc.perform(post("/api/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"X\",\"subject\":\"Y\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void anonymousCanReadStatus() throws Exception {
        mvc.perform(get("/status")).andExpect(status().isOk());
    }

    @Test
    void anonymousCanListLessons() throws Exception {
        mvc.perform(get("/api/lessons")).andExpect(status().isOk());
    }
}