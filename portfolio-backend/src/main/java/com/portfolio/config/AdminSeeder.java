package com.portfolio.config;

import com.portfolio.auth.model.Role;
import com.portfolio.auth.model.User;
import com.portfolio.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedAdmin() {

        boolean exists =
                userRepository.existsByEmail(
                        adminEmail
                );

        if (exists) {
            return;
        }

        User admin = new User();

        admin.setUsername(
                adminUsername
        );

        admin.setEmail(
                adminEmail
        );

        admin.setPassword(
                passwordEncoder.encode(
                        adminPassword
                )
        );

        admin.setRole(
                Role.ROLE_ADMIN
        );

        userRepository.save(admin);

        System.out.println(
                "ADMIN ACCOUNT CREATED"
        );
    }
}