package com.portfolio.security;

import com.portfolio.auth.model.User;
import com.portfolio.auth.repository.UserRepository;
import com.portfolio.config.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        System.out.println("🔍 JWT Filter processing: " + path);

        String token = extractToken(request);

        // If no token, continue without authentication
        if (token == null) {
            System.out.println("❌ No token found for: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("✅ Token found: " + token.substring(0, Math.min(token.length(), 30)) + "...");

        // If token invalid, send 401 instead of continuing
        if (!jwtService.isValid(token)) {
            System.out.println("❌ Token is invalid or expired for: " + path);
            // Send 401 Unauthorized instead of continuing
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Token expired or invalid\"}");
            return; // Don't continue the filter chain
        }

        try {
            String email = jwtService.extractEmail(token);
            System.out.println("📧 Token email: " + email);

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                System.out.println("❌ User not found for email: " + email);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"User not found\"}");
                return;
            }

            String role = jwtService.extractRole(token);
            System.out.println("🔑 Role: " + role);

            if (role == null) {
                System.out.println("❌ Role not found in token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Invalid token\"}");
                return;
            }

            // Set authentication
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            List.of(new SimpleGrantedAuthority(role))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("✅ Authentication set for user: " + user.getEmail() + " with role: " + role);

        } catch (Exception e) {
            System.out.println("❌ Error processing token: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            try {
                response.getWriter().write("{\"success\":false,\"message\":\"Authentication error\"}");
            } catch (IOException ioException) {
                // Log the error but don't throw
                System.err.println("Error writing response: " + ioException.getMessage());
            }
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Try Authorization header first
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            System.out.println("📨 Found token in Authorization header");
            return header.substring(7);
        }

        // 2. Try cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    System.out.println("🍪 Found access_token cookie");
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}