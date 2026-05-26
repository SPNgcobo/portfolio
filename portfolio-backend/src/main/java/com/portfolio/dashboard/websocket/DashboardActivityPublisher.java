package com.portfolio.dashboard.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class DashboardActivityPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public DashboardActivityPublisher(
            SimpMessagingTemplate messagingTemplate
    ) {

        this.messagingTemplate = messagingTemplate;
    }

    /*
     * PUBLISH ACTIVITY
     */
    public void publish(
            String type,
            String message
    ) {

        DashboardActivity activity =
                new DashboardActivity(
                        type,
                        message,
                        new Date()
                );

        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                activity
        );
    }
}