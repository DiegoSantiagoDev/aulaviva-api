package com.aulaviva.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.aulaviva.api.model.AccountStatus;
import com.aulaviva.api.model.Role;
import com.aulaviva.api.model.UserAccount;
import com.aulaviva.api.repository.UserAccountRepository;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserAccountRepository users;
    private final PasswordEncoder encoder;
    private final String name;
    private final String email;
    private final String password;

    public AdminSeeder(UserAccountRepository users,
                       PasswordEncoder encoder,
                       @Value("${aulaviva.admin.name:Administrador}") String name,
                       @Value("${aulaviva.admin.email:}") String email,
                       @Value("${aulaviva.admin.password:}") String password) {
        this.users = users;
        this.encoder = encoder;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank()) {
            log.warn("ADMIN_EMAIL/ADMIN_PASSWORD não definidos: conta de administrador não criada.");
            return;
        }
        if (password.length() < 8) {
            throw new IllegalStateException("ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (users.existsByEmail(normalizedEmail)) {
            return;
        }

        users.save(new UserAccount(
                name,
                normalizedEmail,
                encoder.encode(password),
                Role.ADMIN,
                AccountStatus.APPROVED));
        log.info("Conta de administrador criada: {}", normalizedEmail);
    }
}