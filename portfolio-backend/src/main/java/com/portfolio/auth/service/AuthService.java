package com.portfolio.auth.service;

import com.portfolio.auth.dto.*;
import com.portfolio.auth.model.Role;
import com.portfolio.auth.model.User;
import com.portfolio.auth.repository.UserRepository;
import com.portfolio.common.exceptions.AuthenticationException;
import com.portfolio.config.JwtService;
import com.portfolio.project.service.EmailService;
import com.portfolio.project.service.NotificationEventService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    /*
     * 7 DAYS
     */
    private static final long
            REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 7;

    /*
     * ACCOUNT SECURITY
     */
    private static final int
            MAX_FAILED_ATTEMPTS = 5;

    /*
     * 15 MINUTES
     */
    private static final long
            LOCK_TIME_DURATION =
            1000L * 60 * 15;

    /*
     * PASSWORD RESET
     * 15 MINUTES
     */
    private static final long
            PASSWORD_RESET_EXPIRATION =
            1000L * 60 * 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final NotificationEventService notificationEventService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            NotificationEventService notificationEventService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.notificationEventService = notificationEventService;
    }

    /*
     * LOCK ACCOUNT
     */
    private void lockAccount(User user) {
        user.setAccountLocked(true);
        user.setLockoutEndTime(
                new Date(System.currentTimeMillis() + LOCK_TIME_DURATION)
        );
        userRepository.save(user);
    }

    /*
     * UNLOCK ACCOUNT
     */
    private void unlockAccount(User user) {
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockoutEndTime(null);
        userRepository.save(user);
    }

    /*
     * FAILED LOGIN
     */
    private void processFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            lockAccount(user);
        } else {
            userRepository.save(user);
        }
    }

    /*
     * REGISTER
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthenticationException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
                new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION)
        );

        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        user.setPasswordLastChanged(new Date());

        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        } catch (Exception e) {
            log.error("⚠️ Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }

        notificationEventService.broadcast(
                "NEW_USER",
                "New user registered: " + request.getEmail()
        );

        String jwt = jwtService.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(jwt, refreshToken, user.getRole().name());
    }

    /*
     * LOGIN
     */
    public AuthResponse login(LoginRequest request) {
        System.out.println("🔑 Login attempt for email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("❌ User not found: " + request.getEmail());
                    return new AuthenticationException("Invalid credentials");
                });

        System.out.println("✅ User found: " + user.getEmail());
        System.out.println("🔐 Stored password hash length: " + (user.getPassword() != null ? user.getPassword().length() : 0));

        if (user.isAccountLocked()) {
            if (user.getLockoutEndTime() != null
                    && user.getLockoutEndTime().before(new Date())) {
                unlockAccount(user);
            } else {
                throw new AuthenticationException("Account temporarily locked. Try again later.");
            }
        }

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        System.out.println("🔑 Password matches: " + matches);

        if (!matches) {
            processFailedLogin(user);

            int remainingAttempts = MAX_FAILED_ATTEMPTS - user.getFailedLoginAttempts();
            if (remainingAttempts <= 0) {
                throw new AuthenticationException("Account locked for 15 minutes due to too many failed login attempts.");
            }
            throw new AuthenticationException("Invalid credentials. Remaining attempts: " + remainingAttempts);
        }

        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setLockoutEndTime(null);

        String jwt = jwtService.generateToken(user.getEmail(), user.getRole());

        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
                new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION)
        );
        user.setUpdatedAt(new Date());

        userRepository.save(user);

        System.out.println("✅ Login successful for: " + user.getEmail());

        return new AuthResponse(jwt, refreshToken, user.getRole().name());
    }

    /*
     * REFRESH TOKEN
     */
    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new AuthenticationException("Refresh token is required");
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        Date expiry = user.getRefreshTokenExpiry();
        if (expiry == null) {
            throw new AuthenticationException("Refresh token expired");
        }

        if (expiry.before(new Date())) {
            throw new AuthenticationException("Refresh token expired");
        }

        String newRefreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(
                new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION)
        );
        user.setUpdatedAt(new Date());

        userRepository.save(user);

        String newJwt = jwtService.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(newJwt, newRefreshToken, user.getRole().name());
    }

    /*
     * LOGOUT
     */
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return;
        }

        User user = userRepository.findByRefreshToken(refreshToken).orElse(null);
        if (user != null) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            user.setUpdatedAt(new Date());
            userRepository.save(user);
        }
    }

    /*
     * FORGOT PASSWORD
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiry(
                new Date(System.currentTimeMillis() + PASSWORD_RESET_EXPIRATION)
        );

        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            log.error("⚠️ Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again.");
        }
    }

    /*
     * RESET PASSWORD
     */
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isEmpty()) {
            throw new AuthenticationException("Invalid reset token");
        }

        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new AuthenticationException("Invalid reset token"));

        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().before(new Date())) {
            throw new AuthenticationException("Reset token expired");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new AuthenticationException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        user.setPasswordLastChanged(new Date());
        user.setUpdatedAt(new Date());

        userRepository.save(user);

        log.info("✅ Password reset successful for user: {}", user.getEmail());
    }

    /*
     * UPDATE USERNAME
     */
    public User updateUsername(User user, String newUsername) {
        user.setUsername(newUsername);
        user.setUpdatedAt(new Date());
        return userRepository.save(user);
    }

    /*
     * GET OR CREATE TIMESTAMP - For existing users without createdAt
     */
    private Date getCreatedAt(User user) {
        if (user.getCreatedAt() != null) {
            return user.getCreatedAt();
        }
        Date now = new Date();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);
        return now;
    }

    /*
     * CHANGE PASSWORD
     */
    public void changePassword(User user, ChangePasswordRequest request) {
        boolean matches = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword());

        if (!matches) {
            throw new AuthenticationException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordLastChanged(new Date());
        user.setUpdatedAt(new Date());

        userRepository.save(user);
    }

    /*
     * DELETE ACCOUNT
     */
    public void deleteAccount(User user, DeleteAccountRequest request, HttpServletRequest httpRequest) {
        String email = user.getEmail();
        String username = user.getUsername();
        String reason = request != null ? request.getReason() : "No reason provided";
        String feedback = request != null ? request.getFeedback() : "";

        log.info("🗑️ Account deletion requested for: {}", email);
        log.info("📝 Reason: {}", reason);
        if (!feedback.isEmpty()) {
            log.info("💬 Feedback: {}", feedback);
        }

        notificationEventService.broadcast(
                "ACCOUNT_DELETED",
                "User account deleted: " + email + " - Reason: " + reason
        );

        notificationEventService.notifyAdmin(
                "ACCOUNT_DELETED",
                "🗑️ Account Deletion\n\n" +
                        "User: " + username + " (" + email + ")\n" +
                        "Reason: " + reason +
                        (feedback.isEmpty() ? "" : "\nFeedback: " + feedback) +
                        "\nIP: " + httpRequest.getRemoteAddr()
        );

        try {
            emailService.sendAccountDeletionConfirmation(email, username);
            log.info("📧 Account deletion confirmation email sent to: {}", email);
        } catch (Exception e) {
            log.error("❌ Failed to send account deletion confirmation email: {}", e.getMessage());
        }

        userRepository.delete(user);
        log.info("✅ Account deleted successfully: {}", email);
    }
}