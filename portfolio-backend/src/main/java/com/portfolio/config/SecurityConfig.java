package com.portfolio.config;

import com.portfolio.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter
    ) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http
    ) throws Exception {

        http

                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * AUTH
                         */
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        /*
                         * CONTACT
                         */
                        .requestMatchers(
                                "/api/contact/**"
                        ).permitAll()

                        /*
                         * WEBSOCKET
                         */
                        .requestMatchers(
                                "/ws/**"
                        ).permitAll()

                        /*
                         * ANALYTICS
                         */
                        .requestMatchers(
                                "/api/analytics/**"
                        ).permitAll()

                        /*
                         * ACCESS REQUESTS
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/access-requests"
                        ).authenticated()

                        .requestMatchers(
                                "/api/access-requests/*/approve",
                                "/api/access-requests/*/reject"
                        ).hasRole("ADMIN")

                        /*
                         * PUBLIC MEDIA READ
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/media/**"
                        ).permitAll()

                        /*
                         * PUBLIC SKILLS READ
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/skills/**"
                        ).permitAll()

                        /*
                         * PUBLIC TOOLS READ
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/tools/**"
                        ).permitAll()

                        /*
                         * AUDIT LOGS
                         */
                        .requestMatchers(
                                "/api/audit-logs/**"
                        ).hasRole("ADMIN")

                        /*
                         * PUBLIC PROJECT READ
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projects/**"
                        ).permitAll()

                        /*
                         * PUBLIC PROJECT ENGAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects/*/view"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects/*/like"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects/*/github-click"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects/*/demo-click"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects/*/detail-click"
                        ).permitAll()

                        /*
                         * PUBLIC BLOG READ
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/blogs/**"
                        ).permitAll()

                        /*
                         * GLOBAL SEARCH
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/search/**"
                        ).permitAll()

                        /*
                         * ADMIN BLOG MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/blogs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/blogs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/blogs/**"
                        ).hasRole("ADMIN")

                        /*
                         * COMMENTS
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/comments/project/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/comments/**"
                        ).authenticated()

                        /*
                         * NOTIFICATIONS
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/notifications/**"
                        ).permitAll()

                        /*
                         * ADMIN COMMENT MODERATION
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/comments/pending"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/comments/*/approve"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/comments/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN NOTIFICATIONS
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/notifications/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/notifications/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN PROJECT MANAGEMENT
                         */
                        .requestMatchers(
                                "/api/admin/projects/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projects"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/projects/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/projects/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN MEDIA MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/media/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/media/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/media/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN SKILLS MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/skills/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/skills/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/skills/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN TOOLS MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/tools/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/tools/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/tools/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN UPLOADS
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/uploads/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/uploads/**"
                        ).hasRole("ADMIN")

                        /*
                         * ADMIN DASHBOARD
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/admin/dashboard/**"
                        ).hasRole("ADMIN")

                        /*
                         * EVERYTHING ELSE
                         */
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }
}