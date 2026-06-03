package com.portfolio.auth.controller;

import com.portfolio.auth.dto.ForgotPasswordRequest;
import com.portfolio.auth.dto.ResetPasswordRequest;
import com.portfolio.auth.dto.*;
import com.portfolio.auth.service.AuthService;
import com.portfolio.common.ApiResponse;
import com.portfolio.security.CurrentUserService;
import com.portfolio.auth.model.User;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    // COOKIE ENV CONTROL (LOCAL vs PROD)
    @Value("${app.cookie.secure}")
    private boolean secureCookie;

    public AuthController(
            AuthService authService,
            CurrentUserService currentUserService
    ) {
        this.authService = authService;
        this.currentUserService = currentUserService;
    }

    /*
     * REGISTER
     */
    @PostMapping("/register")
    public ApiResponse<Void> register(
            @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {

        AuthResponse auth = authService.register(request);

        setCookies(response, auth);

        return new ApiResponse<>(true, "Registration successful", null);
    }

    /*
     * LOGIN
     */
    @PostMapping("/login")
    public ApiResponse<Void> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {

        AuthResponse auth = authService.login(request);

        setCookies(response, auth);

        return new ApiResponse<>(true, "Login successful", null);
    }

    /*
     * ME ENDPOINT
     */
    @GetMapping("/me")
    public ApiResponse<UserInfoResponse> me() {

        User user = currentUserService.getCurrentUser();

        UserInfoResponse response = new UserInfoResponse(
                user.getEmail(),
                user.getRole().name()
        );

        return new ApiResponse<>(true, "User fetched", response);
    }

    /*
     * REFRESH
     */
    @PostMapping("/refresh")
    public ApiResponse<Void> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        String refreshToken = extractCookie(request, "refresh_token");

        AuthResponse auth = authService.refresh(refreshToken);

        setCookies(response, auth);

        return new ApiResponse<>(true, "Token refreshed", null);
    }

    /*
     * LOGOUT
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        String refreshToken = extractCookie(request, "refresh_token");

        authService.logout(refreshToken);

        clearCookies(response);

        return new ApiResponse<>(true, "Logged out successfully", null);
    }

    /*
     * FORGOT PASSWORD
     */
    @PostMapping("/forgot-password")
    public ApiResponse<Object> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {

        authService.forgotPassword(request);

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
            @RequestBody ResetPasswordRequest request
    ) {

        authService.resetPassword(request);

        return new ApiResponse<>(
                true,
                "Password reset successful",
                null
        );
    }

    // ================= COOKIE HELPERS =================

    private void setCookies(HttpServletResponse response, AuthResponse auth) {

        ResponseCookie accessCookie =
                ResponseCookie.from("access_token", auth.getToken())
                        .httpOnly(true)
                        .secure(secureCookie)
                        .path("/")
                        .maxAge(15 * 60)
                        .sameSite("None")
                        .build();

        ResponseCookie refreshCookie =
                ResponseCookie.from("refresh_token", auth.getRefreshToken())
                        .httpOnly(true)
                        .secure(secureCookie)
                        .path("/")
                        .maxAge(7 * 24 * 60 * 60)
                        .sameSite("None")
                        .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void clearCookies(HttpServletResponse response) {

        ResponseCookie accessCookie =
                ResponseCookie.from("access_token", "")
                        .path("/")
                        .maxAge(0)
                        .build();

        ResponseCookie refreshCookie =
                ResponseCookie.from("refresh_token", "")
                        .path("/")
                        .maxAge(0)
                        .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private String extractCookie(HttpServletRequest request, String name) {

        if (request.getCookies() == null) return null;

        return Arrays.stream(request.getCookies())
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}