package com.portfolio.auth.controller;

import com.portfolio.auth.dto.*;
import com.portfolio.auth.repository.UserRepository;
import com.portfolio.auth.service.AuthService;
import com.portfolio.common.ApiResponse;
import com.portfolio.common.exceptions.AuthenticationException;
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
import java.util.Date;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    // COOKIE ENV CONTROL (LOCAL vs PROD)
    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    public AuthController(
            AuthService authService,
            CurrentUserService currentUserService,
            UserRepository userRepository
    ) {
        this.authService = authService;
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
    }

    /*
     * REGISTER
     */
    @PostMapping("/register")
    public ApiResponse<Void> register(
            @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        System.out.println("📝 Register request for: " + request.getEmail());
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
        System.out.println("🔑 Login attempt for: " + request.getEmail());
        try {
            AuthResponse auth = authService.login(request);
            setCookies(response, auth);
            System.out.println("✅ Login successful for: " + request.getEmail());
            return new ApiResponse<>(true, "Login successful", null);
        } catch (AuthenticationException e) {
            System.err.println("❌ Login failed for " + request.getEmail() + ": " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Unexpected error for " + request.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /*
     * ME ENDPOINT
     */
    @GetMapping("/me")
    public ApiResponse<UserInfoResponse> me() {
        User user = currentUserService.getCurrentUser();
        UserInfoResponse response = new UserInfoResponse(
                user.getEmail(),
                user.getRole().name(),
                user.getUsername()
        );
        return new ApiResponse<>(true, "User fetched", response);
    }

    /*
     * GET FULL PROFILE
     */
    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile() {
        User user = currentUserService.getCurrentUser();

        Date createdAt = user.getCreatedAt();
        if (createdAt == null) {
            createdAt = new Date();
            user.setCreatedAt(createdAt);
            user.setUpdatedAt(createdAt);
            userRepository.save(user);
        }

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getPasswordLastChanged()
        );

        return new ApiResponse<>(true, "Profile fetched", response);
    }

    /*
     * UPDATE USERNAME
     */
    @PutMapping("/profile/username")
    public ApiResponse<UserProfileResponse> updateUsername(
            @RequestBody UpdateUsernameRequest request
    ) {
        User user = currentUserService.getCurrentUser();
        User updatedUser = authService.updateUsername(user, request.getUsername());

        UserProfileResponse response = new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getRole().name(),
                updatedUser.getCreatedAt(),
                updatedUser.getUpdatedAt(),
                updatedUser.getPasswordLastChanged()
        );

        return new ApiResponse<>(true, "Username updated successfully", response);
    }

    /*
     * CHANGE PASSWORD
     */
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        User user = currentUserService.getCurrentUser();
        authService.changePassword(user, request);
        return new ApiResponse<>(true, "Password changed successfully", null);
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
        System.out.println("🔄 Refresh token request: " + (refreshToken != null ? "Token present" : "No token"));

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
        System.out.println("🔑 Reset password request received");
        System.out.println("📝 Token: " + request.getToken());

        try {
            authService.resetPassword(request);
            System.out.println("✅ Password reset successful");
            return new ApiResponse<>(
                    true,
                    "Password reset successful",
                    null
            );
        } catch (AuthenticationException e) {
            System.err.println("❌ Authentication error: " + e.getMessage());
            return new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null
            );
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(
                    false,
                    "Failed to reset password. Please try again.",
                    null
            );
        }
    }

    /*
     * DELETE ACCOUNT
     */
    @DeleteMapping("/account")
    public ApiResponse<Void> deleteAccount(
            @RequestBody(required = false) DeleteAccountRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        User user = currentUserService.getCurrentUser();
        authService.deleteAccount(user, request, httpRequest);
        clearCookies(response);
        return new ApiResponse<>(true, "Account deleted successfully", null);
    }

    // ================= COOKIE HELPERS =================

    private void setCookies(HttpServletResponse response, AuthResponse auth) {
        boolean isSecure = secureCookie;

        ResponseCookie accessCookie =
                ResponseCookie.from("access_token", auth.getToken())
                        .httpOnly(true)
                        .secure(isSecure)
                        .path("/")
                        .maxAge(15 * 60)
                        .sameSite(isSecure ? "None" : "Lax")
                        .build();

        ResponseCookie refreshCookie =
                ResponseCookie.from("refresh_token", auth.getRefreshToken())
                        .httpOnly(true)
                        .secure(isSecure)
                        .path("/")
                        .maxAge(7 * 24 * 60 * 60)
                        .sameSite(isSecure ? "None" : "Lax")
                        .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        System.out.println("🍪 Cookie settings - Secure: " + isSecure + ", SameSite: " + (isSecure ? "None" : "Lax"));
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