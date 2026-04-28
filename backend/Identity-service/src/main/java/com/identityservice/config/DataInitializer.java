package com.identityservice.config;

import com.identityservice.entity.*;
import com.identityservice.repository.AccountRepository;
import com.identityservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing mock accounts...");
        
        // 1. SUPER_ADMIN
        createAccountIfNotExist("superadmin", "superadmin@iuh.edu.vn", "123456", Role.SUPER_ADMIN, "Super Admin System");
        
        // 2. ADMIN
        createAccountIfNotExist("admin1", "admin1@iuh.edu.vn", "123456", Role.ADMIN, "Admin Khoa CNTT");
        createAccountIfNotExist("admin2", "admin2@iuh.edu.vn", "123456", Role.ADMIN, "Admin Phòng Công tác SV");
        
        // 3. LECTURERS
        createAccountIfNotExist("giangvien1", "gv1@iuh.edu.vn", "123456", Role.LECTURER, "Nguyễn Văn A (Giảng viên)");
        createAccountIfNotExist("giangvien2", "gv2@iuh.edu.vn", "123456", Role.LECTURER, "Trần Thị B (Giảng viên)");
        
        // 4. STUDENTS
        createAccountIfNotExist("sinhvien1", "sv1@student.iuh.edu.vn", "123456", Role.STUDENT, "Lê Văn C (Sinh viên)");
        createAccountIfNotExist("sinhvien2", "sv2@student.iuh.edu.vn", "123456", Role.STUDENT, "Phạm Thị D (Sinh viên)");
        createAccountIfNotExist("sinhvien3", "sv3@student.iuh.edu.vn", "123456", Role.STUDENT, "Hoàng Văn E (Sinh viên)");
        
        log.info("Mock accounts initialization completed.");
    }

    private void createAccountIfNotExist(String username, String email, String password, Role role, String fullName) {
        if (accountRepository.findByUsername(username).isPresent()) {
            return;
        }

        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.setRole(role);
        account.setStatus(AccountStatus.ACTIVE);
        account.setCreatedAt(LocalDateTime.now());
        
        Account savedAccount = accountRepository.save(account);

        User user = new User();
        user.setAccount(savedAccount);
        user.setFullName(fullName);
        user.setGender(Gender.MALE);
        user.setDateOfBirth(LocalDate.of(1990, 1, 1));
        user.setCreatedAt(LocalDateTime.now());
        
        userRepository.save(user);
        
        log.info("Created account: {} with role: {}", username, role);
    }
}
