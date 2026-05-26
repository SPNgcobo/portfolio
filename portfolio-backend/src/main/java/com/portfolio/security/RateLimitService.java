package com.portfolio.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    /*
     * MAX REQUESTS
     */
    private static final int MAX_REQUESTS = 20;

    /*
     * WINDOW
     * 1 minute
     */
    private static final long WINDOW_MS =
            60_000;

    /*
     * STORAGE
     */
    private final Map<String, RequestData>
            requests =
            new ConcurrentHashMap<>();

    /*
     * CHECK
     */
    public boolean isAllowed(
            String key
    ) {

        long now =
                System.currentTimeMillis();

        RequestData data =
                requests.getOrDefault(
                        key,
                        new RequestData(
                                0,
                                now
                        )
                );

        /*
         * RESET WINDOW
         */
        if (
                now - data.windowStart
                        > WINDOW_MS
        ) {

            data = new RequestData(
                    0,
                    now
            );
        }

        /*
         * BLOCK
         */
        if (data.count >= MAX_REQUESTS) {

            return false;
        }

        data.count++;

        requests.put(key, data);

        return true;
    }

    /*
     * INNER CLASS
     */
    private static class RequestData {

        int count;

        long windowStart;

        public RequestData(
                int count,
                long windowStart
        ) {

            this.count = count;
            this.windowStart = windowStart;
        }
    }
}