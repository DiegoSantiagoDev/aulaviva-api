package com.aulaviva.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aulaviva.api.model.AccountStatus;
import com.aulaviva.api.model.Role;
import com.aulaviva.api.model.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    List<UserAccount> findByRoleAndStatusOrderByCreatedAtAsc(Role role, AccountStatus status);
}