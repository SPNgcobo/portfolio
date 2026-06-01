package com.portfolio.config;

import com.portfolio.auth.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    /*
     * 15 MINUTES
     */
    private static final long JWT_EXPIRATION =
            1000L * 60 * 15;

    private SecretKey key;

    @PostConstruct
    public void init() {

        key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    /*
     * GENERATE TOKEN
     */
    public String generateToken(
            String email,
            Role role
    ) {

        return Jwts.builder()

                .subject(email)

                .claim(
                        "role",
                        role.name()
                )

                .issuedAt(
                        new Date()
                )

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + JWT_EXPIRATION
                        )
                )

                .signWith(key)

                .compact();
    }

    /*
     * EXTRACT EMAIL
     */
    public String extractEmail(
            String token
    ) {

        return extractClaims(token)
                .getSubject();
    }

    /*
     * EXTRACT ROLE
     */
    public String extractRole(
            String token
    ) {

        return extractClaims(token)
                .get("role", String.class);
    }

    /*
     * CLAIMS
     */
    private Claims extractClaims(
            String token
    ) {

        return Jwts.parser()

                .verifyWith(key)

                .build()

                .parseSignedClaims(token)

                .getPayload();
    }

    /*
     * VALIDATE
     */
    public boolean isValid(
            String token
    ) {

        try {

            extractClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}