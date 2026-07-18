package com.simplebank.bankapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.repos.UserRepository;

/**
 * Seeds a default ADMIN user on startup, if one doesn't already exist. There's no
 * public endpoint that lets someone grant themselves the ADMIN role (see
 * AppUserDetails/UserService) - this is the only way an admin account gets created.
 *
 * Credentials come from application.properties (app.admin.*), overridable via the
 * ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD environment variables. Change the password
 * from its default before deploying this anywhere reachable by anyone else.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User(adminName, adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        log.info("Seeded default admin user with email: {}", adminEmail);
    }
}
