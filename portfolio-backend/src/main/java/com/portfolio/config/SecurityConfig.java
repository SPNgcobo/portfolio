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
                         * ADMIN BLOG MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/blogs/admin/blogs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/blogs/admin/blogs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/blogs/admin/blogs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/blogs/admin/blogs/**"
                        ).hasRole("ADMIN")

                        /*
                         * GLOBAL SEARCH
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/search/**"
                        ).permitAll()

                        /*
                         * COMMENTS - Consolidated all comment rules
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/comments/project/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/comments/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/comments/*/edit"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/comments/admin/*/edit"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/comments/*"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/comments/admin/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/comments/pending"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/comments/*/approve"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/comments/*/reply"
                        ).hasRole("ADMIN")

                        /*
                         * NOTIFICATIONS - Public read for active notifications
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/notifications/active"
                        ).permitAll()

                        /*
                         * ADMIN NOTIFICATIONS MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/notifications"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/notifications"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/notifications/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/notifications/*"
                        ).hasRole("ADMIN")

                        /*
                         * ACTIVITY EVENTS (ADMIN ONLY)
                         */
                        .requestMatchers(
                                "/api/activity-events/**"
                        ).hasRole("ADMIN")

                        /*
                         * USER NOTIFICATIONS - Authenticated users can view and manage their own
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/notifications/user/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/notifications/user/me/unread/count"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/notifications/user/me/read/all"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/notifications/user/me/*/read"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/notifications/user/me/all"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/notifications/user/me/*"
                        ).authenticated()

                        /*
                         * ADMIN MEDIA MANAGEMENT
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/media"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/media/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/media/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/media/*"
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
                                "/api/skills/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/skills/*"
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
                                "/api/tools/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/tools/*"
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