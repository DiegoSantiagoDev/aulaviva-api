package com.aulaviva.api.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.aulaviva.api.model.AccountStatus;
import com.aulaviva.api.model.Role;
import com.aulaviva.api.model.UserAccount;
import com.aulaviva.api.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    private static final String PASSWORD = "senha-forte-123";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserAccountRepository users;

    @Autowired
    private PasswordEncoder encoder;

    private ResultActions postJson(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private ResultActions register(String email) throws Exception {
        return postJson("/api/auth/register",
                "{\"name\":\"Maria\",\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}");
    }

    private ResultActions login(String email, String password) throws Exception {
        return postJson("/api/auth/login",
                "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
    }

    @Test
    void registerCreatesPendingProfessor() throws Exception {
        register("maria@teste.com").andExpect(status().isCreated());

        UserAccount saved = users.findByEmail("maria@teste.com").orElseThrow();
        assertEquals(AccountStatus.PENDING, saved.getStatus());
        assertEquals(Role.PROFESSOR, saved.getRole());
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        register("duplicado@teste.com").andExpect(status().isCreated());
        register("duplicado@teste.com").andExpect(status().isConflict());
    }

    @Test
    void loginBlocksPendingAccount() throws Exception {
        register("pendente@teste.com").andExpect(status().isCreated());

        login("pendente@teste.com", PASSWORD).andExpect(status().isForbidden());
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        users.save(new UserAccount("Joao", "joao@teste.com",
                encoder.encode(PASSWORD), Role.PROFESSOR, AccountStatus.APPROVED));

        login("joao@teste.com", "senha-errada-999").andExpect(status().isUnauthorized());
    }

    @Test
    void loginReturnsTokenForApprovedAccount() throws Exception {
        users.save(new UserAccount("Ana", "ana@teste.com",
                encoder.encode(PASSWORD), Role.PROFESSOR, AccountStatus.APPROVED));

        login("ana@teste.com", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("PROFESSOR"));
    }
}