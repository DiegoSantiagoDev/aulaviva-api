package com.aulaviva.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aulaviva.api.dto.LoginRequest;
import com.aulaviva.api.dto.LoginResponse;
import com.aulaviva.api.dto.RegisterRequest;
import com.aulaviva.api.exception.AccountNotApprovedException;
import com.aulaviva.api.exception.InvalidCredentialsException;
import com.aulaviva.api.exception.InvalidStateException;
import com.aulaviva.api.model.AccountStatus;
import com.aulaviva.api.model.Role;
import com.aulaviva.api.model.UserAccount;
import com.aulaviva.api.repository.UserAccountRepository;

@Service
public class AuthService {

    private final UserAccountRepository users;
    private final PasswordEncoder encoder;
    private final TokenService tokens;

    public AuthService(UserAccountRepository users, PasswordEncoder encoder, TokenService tokens) {
        this.users = users;
        this.encoder = encoder;
        this.tokens = tokens;
    }

    public void register(RegisterRequest request) {
        String email = normalize(request.email());
        if (users.existsByEmail(email)) {
            throw new InvalidStateException("Já existe uma conta com este e-mail.");
        }
        users.save(new UserAccount(
                request.name().trim(),
                email,
                encoder.encode(request.password()),
                Role.PROFESSOR,
                AccountStatus.PENDING));
    }

    public LoginResponse login(LoginRequest request) {
        UserAccount user = users.findByEmail(normalize(request.email()))
                .filter(found -> encoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        if (user.getStatus() == AccountStatus.PENDING) {
            throw new AccountNotApprovedException(
                    "Sua conta ainda aguarda aprovação do administrador.");
        }
        if (user.getStatus() == AccountStatus.REJECTED) {
            throw new AccountNotApprovedException("Seu cadastro não foi aprovado.");
        }

        TokenService.IssuedToken token = tokens.issue(user);
        return new LoginResponse(
                token.value(), token.expiresAt(), user.getName(), user.getRole().name());
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase();
    }
}