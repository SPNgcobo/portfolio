package com.portfolio.analytics.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class VisitorFingerprintService {

    public String generateFingerprint(
            HttpServletRequest request
    ) {

        try {

            String ip =
                    request.getRemoteAddr();

            String userAgent =
                    request.getHeader(
                            "User-Agent"
                    );

            String language =
                    request.getHeader(
                            "Accept-Language"
                    );

            String raw =
                    ip +
                            "|" +
                            userAgent +
                            "|" +
                            language;

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            raw.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder builder =
                    new StringBuilder();

            for (byte b : hash) {

                builder.append(
                        String.format(
                                "%02x",
                                b
                        )
                );
            }

            return builder.toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate fingerprint"
            );
        }
    }
}