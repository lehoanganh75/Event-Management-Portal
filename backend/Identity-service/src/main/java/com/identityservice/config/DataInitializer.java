package com.identityservice.config;

import com.identityservice.entity.AccountStatus;
import com.identityservice.entity.Gender;
import com.identityservice.entity.Role;
import com.identityservice.entity.User;
import com.identityservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Bắt đầu khởi tạo dữ liệu mẫu cho bảng users...");
            
            // Đặt mật khẩu mặc định là 123456
            String defaultPassword = passwordEncoder.encode("123456");

            User superAdmin = User.builder()
                    .username("super_admin")
                    .email("superadmin@iuh.edu.vn")
                    .passwordHash(defaultPassword)
                    .role(Role.SUPER_ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .fullName("Người Quản Trị Hệ Thống (SA)")
                    .gender(Gender.MALE)
                    .dateOfBirth(LocalDate.of(1995, 1, 1))
                    .phone("0901234560")
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=SA")
                    .build();

            User admin = User.builder()
                    .username("admin_user")
                    .email("admin@iuh.edu.vn")
                    .passwordHash(defaultPassword)
                    .role(Role.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .fullName("Quản Lý Sự Kiện (AD)")
                    .gender(Gender.MALE)
                    .dateOfBirth(LocalDate.of(1996, 5, 15))
                    .phone("0901234561")
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=AD")
                    .build();

            User member1 = User.builder()
                    .username("student_01")
                    .email("student01@student.iuh.edu.vn")
                    .passwordHash(defaultPassword)
                    .role(Role.STUDENT)
                    .status(AccountStatus.ACTIVE)
                    .fullName("Trần Văn A")
                    .gender(Gender.MALE)
                    .dateOfBirth(LocalDate.of(2003, 2, 10))
                    .phone("0901234563")
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=A")
                    .build();

            User member2 = User.builder()
                    .username("student_02")
                    .email("student02@student.iuh.edu.vn")
                    .passwordHash(defaultPassword)
                    .role(Role.STUDENT)
                    .status(AccountStatus.ACTIVE)
                    .fullName("Lê Thị B")
                    .gender(Gender.FEMALE)
                    .dateOfBirth(LocalDate.of(2003, 8, 20))
                    .phone("0901234564")
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=B")
                    .build();

            User guest = User.builder()
                    .username("guest_01")
                    .email("guest01@gmail.com")
                    .passwordHash(defaultPassword)
                    .role(Role.GUEST)
                    .status(AccountStatus.ACTIVE)
                    .fullName("Khách Hàng 01")
                    .gender(Gender.FEMALE)
                    .dateOfBirth(LocalDate.of(1998, 11, 11))
                    .phone("0901234566")
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=G1")
                    .build();

            userRepository.saveAll(Arrays.asList(superAdmin, admin, member1, member2, guest));
            log.info("Khởi tạo dữ liệu thành công với 5 tài khoản mẫu!");
        } else {
            log.info("Dữ liệu đã tồn tại trong bảng users, bỏ qua việc khởi tạo tự động.");
        }
    }
}
