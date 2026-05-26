package com.portfolio.project.service;

import com.portfolio.project.dto.WebSocketEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketBroadcastService(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }

    /*
     * GLOBAL EVENT
     */
    public void broadcast(
            String topic,
            String type,
            Object payload
    ) {

        messagingTemplate.convertAndSend(
                topic,
                new WebSocketEvent(type, payload)
        );
    }
}