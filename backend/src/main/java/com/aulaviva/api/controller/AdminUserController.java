package com.aulaviva.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aulaviva.api.dto.UserSummaryResponse;
import com.aulaviva.api.model.AccountStatus;
import com.aulaviva.api.service.AdminUserService;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserSummaryResponse> list(
            @RequestParam(name = "status", defaultValue = "PENDING") AccountStatus status) {
        return service.listProfessors(status);
    }

    @PostMapping("/{id}/approve")
    public UserSummaryResponse approve(@PathVariable("id") Long id) {
        return service.approve(id);
    }

    @PostMapping("/{id}/reject")
    public UserSummaryResponse reject(@PathVariable("id") Long id) {
        return service.reject(id);
    }
}