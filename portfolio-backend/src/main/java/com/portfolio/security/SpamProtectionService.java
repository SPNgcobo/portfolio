package com.portfolio.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SpamProtectionService {

    /*
     * DUPLICATE WINDOW
     * 30 seconds
     */
    private static final long DUPLICATE_WINDOW =
            30_000;

    /*
     * USER/IP STORAGE
     */
    private final Map<String, SpamData> spamMap =
            new ConcurrentHashMap<>();

    public boolean isSpam(
            String key,
            String content
    ) {

        long now = System.currentTimeMillis();

        SpamData existing =
                spamMap.get(key);

        if (existing == null) {

            spamMap.put(
                    key,
                    new SpamData(content, now)
            );

            return false;
        }

        /*
         * SAME COMMENT
         */
        if (
                existing.content.equalsIgnoreCase(content)
                        &&
                        now - existing.timestamp
                                < DUPLICATE_WINDOW
        ) {

            return true;
        }

        spamMap.put(
                key,
                new SpamData(content, now)
        );

        return false;
    }

    /*
     * INNER CLASS
     */
    private static class SpamData {

        String content;

        long timestamp;

        public SpamData(
                String content,
                long timestamp
        ) {
            this.content = content;
            this.timestamp = timestamp;
        }
    }
}