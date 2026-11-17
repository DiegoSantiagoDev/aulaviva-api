package com.aulaviva.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aulaviva.api.dto.UserSummaryResponse;
import com.aulaviva.api.exception.ResourceNotFoundException;
import com.aulaviva.api.model.AccountStatus;
import com.aulaviva.api.model.Role;
import com.aulaviva.api.model.UserAccount;
import com.aulaviva.api.repository.UserAccountRepository;

@Service
public class AdminUserService {

    private final UserAccountRepository users;

    public AdminUserService(UserAccountRepository users) {
        this.users = users;
    }

    public List<UserSummaryResponse> listProfessors(AccountStatus status) {
        return users.findByRoleAndStatusOrderByCreatedAtAsc(Role.PROFESSOR, status).stream()
                .map(AdminUserService::toResponse)
                .toList();
    }

    public UserSummaryResponse approve(Long id) {
        UserAccount user = findProfessor(id);
        user.approve();
        return toResponse(users.save(user));
    }

    public UserSummaryResponse reject(Long id) {
        UserAccount user = findProfessor(id);
        user.reject();
        return toResponse(users.save(user));
    }

    private UserAccount findProfessor(Long id) {
        return users.findById(id)
                .filter(user -> user.getRole() == Role.PROFESSOR)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado: " + id));
    }

    private static UserSummaryResponse toResponse(UserAccount user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt());
    }
}