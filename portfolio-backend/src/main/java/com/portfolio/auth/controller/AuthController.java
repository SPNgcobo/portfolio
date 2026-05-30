package com.portfolio.auth.controller;

import com.portfolio.auth.dto.AuthResponse;
import com.portfolio.auth.dto.ForgotPasswordRequest;
import com.portfolio.auth.dto.LoginRequest;
import com.portfolio.auth.dto.RegisterRequest;
import com.portfolio.auth.dto.ResetPasswordRequest;
import com.portfolio.auth.service.AuthService;
import com.portfolio.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {

        this.authService = authService;
    }

    /*
     * REGISTER
     */
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {

        return new ApiResponse<>(
                true,
                "Registration successful",
                authService.register(request)
        );
    }

    /*
     * LOGIN
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {

        return new ApiResponse<>(
                true,
                "Login successful",
                authService.login(request)
        );
    }

    /*
     * REFRESH TOKEN
     */
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @RequestParam String refreshToken
    ) {

        return new ApiResponse<>(
                true,
                "Token refreshed",
                authService.refresh(refreshToken)
        );
    }

    /*
     * LOGOUT
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @RequestParam String refreshToken
    ) {

        authService.logout(
                refreshToken
        );

        return new ApiResponse<>(
                true,
                "Logged out successfully",
                null
        );
    }

    /*
     * FORGOT PASSWORD
     */
    @PostMapping("/forgot-password")
    public ApiResponse<Object> forgotPassword(
            @RequestBody
            ForgotPasswordRequest request
    ) {

        authService.forgotPassword(
                request
        );

        return new ApiResponse<>(
                true,
                "Password reset email sent",
                null
        );
    }

    /*
     * RESET PASSWORD
     */
    @PostMapping("/reset-password")
    public ApiResponse<Object> resetPassword(
            @RequestBody
            ResetPasswordRequest request
    ) {

        authService.resetPassword(
                request
        );

        return new ApiResponse<>(
                true,
                "Password reset successful",
                null
        );
    }
}