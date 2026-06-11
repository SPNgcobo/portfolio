package com.portfolio.auth.service;

import com.portfolio.auth.dto.AuthResponse;
import com.portfolio.auth.dto.ForgotPasswordRequest;
import com.portfolio.auth.dto.LoginRequest;
import com.portfolio.auth.dto.RegisterRequest;
import com.portfolio.auth.dto.ResetPasswordRequest;
import com.portfolio.auth.model.Role;
import com.portfolio.auth.model.User;
import com.portfolio.auth.repository.UserRepository;
import com.portfolio.common.exceptions.AuthenticationException;
import com.portfolio.config.JwtService;
import com.portfolio.project.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

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

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    /*
     * LOCK ACCOUNT
     */
    private void lockAccount(
            User user
    ) {

        user.setAccountLocked(true);

        user.setLockoutEndTime(
                new Date(
                        System.currentTimeMillis()
                                + LOCK_TIME_DURATION
                )
        );

        userRepository.save(user);
    }

    /*
     * UNLOCK ACCOUNT
     */
    private void unlockAccount(
            User user
    ) {

        user.setAccountLocked(false);

        user.setFailedLoginAttempts(0);

        user.setLockoutEndTime(null);

        userRepository.save(user);
    }

    /*
     * FAILED LOGIN
     */
    private void processFailedLogin(
            User user
    ) {

        int attempts =
                user.getFailedLoginAttempts() + 1;

        user.setFailedLoginAttempts(
                attempts
        );

        if (attempts >= MAX_FAILED_ATTEMPTS) {

            lockAccount(user);

        } else {

            userRepository.save(user);
        }
    }

    /*
     * REGISTER
     */
    public AuthResponse register(
            RegisterRequest request
    ) {

        if (userRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new AuthenticationException(
                    "Email already exists"
            );
        }

        User user = new User();

        user.setUsername(
                request.getUsername()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(
                Role.ROLE_USER
        );

        String refreshToken =
                UUID.randomUUID().toString();

        user.setRefreshToken(
                refreshToken
        );

        user.setRefreshTokenExpiry(
                new Date(
                        System.currentTimeMillis()
                                + REFRESH_TOKEN_EXPIRATION
                )
        );

        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

        String jwt =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return new AuthResponse(
                jwt,
                refreshToken,
                user.getRole().name()
        );
    }

    /*
     * LOGIN
     */
    public AuthResponse login(
            LoginRequest request
    ) {

        User user =
                userRepository.findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new AuthenticationException(
                                        "Invalid credentials"
                                )
                        );

        if (user.isAccountLocked()) {

            if (user.getLockoutEndTime() != null
                    && user.getLockoutEndTime()
                    .before(new Date())) {

                unlockAccount(user);

            } else {

                throw new AuthenticationException(
                        "Account temporarily locked. Try again later."
                );
            }
        }

        boolean matches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!matches) {

            processFailedLogin(user);

            int remainingAttempts =
                    MAX_FAILED_ATTEMPTS
                            - user.getFailedLoginAttempts();

            if (remainingAttempts <= 0) {

                throw new AuthenticationException(
                        "Account locked for 15 minutes due to too many failed login attempts."
                );
            }

            throw new AuthenticationException(
                    "Invalid credentials. Remaining attempts: "
                            + remainingAttempts
            );
        }

        user.setFailedLoginAttempts(0);

        user.setAccountLocked(false);

        user.setLockoutEndTime(null);

        String jwt =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        String refreshToken =
                UUID.randomUUID().toString();

        user.setRefreshToken(
                refreshToken
        );

        user.setRefreshTokenExpiry(
                new Date(
                        System.currentTimeMillis()
                                + REFRESH_TOKEN_EXPIRATION
                )
        );

        userRepository.save(user);

        return new AuthResponse(
                jwt,
                refreshToken,
                user.getRole().name()
        );
    }

    /*
     * REFRESH TOKEN
     */
    public AuthResponse refresh(
            String refreshToken
    ) {

        User user =
                userRepository
                        .findByRefreshToken(
                                refreshToken
                        )
                        .orElseThrow(() ->
                                new AuthenticationException(
                                        "Invalid refresh token"
                                )
                        );

        if (user.getRefreshTokenExpiry()
                .before(new Date())) {

            throw new AuthenticationException(
                    "Refresh token expired"
            );
        }

        String newRefreshToken =
                UUID.randomUUID().toString();

        user.setRefreshToken(
                newRefreshToken
        );

        user.setRefreshTokenExpiry(
                new Date(
                        System.currentTimeMillis()
                                + REFRESH_TOKEN_EXPIRATION
                )
        );

        userRepository.save(user);

        String newJwt =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return new AuthResponse(
                newJwt,
                newRefreshToken,
                user.getRole().name()
        );
    }

    /*
     * LOGOUT
     */
    public void logout(
            String refreshToken
    ) {

        User user =
                userRepository
                        .findByRefreshToken(
                                refreshToken
                        )
                        .orElseThrow(() ->
                                new AuthenticationException(
                                        "Invalid refresh token"
                                )
                        );

        user.setRefreshToken(null);

        user.setRefreshTokenExpiry(null);

        userRepository.save(user);
    }

    /*
     * FORGOT PASSWORD
     */
    public void forgotPassword(
            ForgotPasswordRequest request
    ) {

        User user =
                userRepository.findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new AuthenticationException(
                                        "User not found"
                                )
                        );

        String token =
                UUID.randomUUID().toString();

        user.setPasswordResetToken(
                token
        );

        user.setPasswordResetExpiry(
                new Date(
                        System.currentTimeMillis()
                                + PASSWORD_RESET_EXPIRATION
                )
        );

        userRepository.save(user);

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                token
        );
    }

    /*
     * RESET PASSWORD
     */
    public void resetPassword(
            ResetPasswordRequest request
    ) {

        User user =
                userRepository
                        .findByPasswordResetToken(
                                request.getToken()
                        )
                        .orElseThrow(() ->
                                new AuthenticationException(
                                        "Invalid reset token"
                                )
                        );

        if (user.getPasswordResetExpiry()
                .before(new Date())) {

            throw new AuthenticationException(
                    "Reset token expired"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        user.setPasswordResetToken(null);

        user.setPasswordResetExpiry(null);

        userRepository.save(user);
    }
}