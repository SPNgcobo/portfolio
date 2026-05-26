package com.portfolio.project.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationEventService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationEventService(
            SimpMessagingTemplate messagingTemplate
    ) {

        this.messagingTemplate =
                messagingTemplate;
    }

    /*
     * REALTIME EVENT
     */
    public void broadcast(
            String type,
            String message
    ) {

        Map<String, String> payload =
                new HashMap<>();

        payload.put("type", type);

        payload.put("message", message);

        messagingTemplate.convertAndSend(
                "/topic/admin-events",
                payload
        );
    }
}