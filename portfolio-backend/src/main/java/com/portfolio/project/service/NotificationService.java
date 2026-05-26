package com.portfolio.project.service;

import com.portfolio.project.model.Notification;
import com.portfolio.project.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    private final WebSocketBroadcastService websocket;

    public NotificationService(
            NotificationRepository repository,
            WebSocketBroadcastService websocket
    ) {

        this.repository = repository;
        this.websocket = websocket;
    }

    /*
     * CREATE
     */
    public Notification create(
            Notification notification
    ) {

        notification.setCreatedAt(
                new Date()
        );

        Notification saved =
                repository.save(notification);

        /*
         * REALTIME PUSH
         */
        websocket.broadcast(
                "/topic/notifications",
                "NOTIFICATION_CREATED",
                saved
        );

        return saved;
    }

    /*
     * GET ACTIVE
     */
    public List<Notification> getActive() {

        return repository.findByActiveTrue();
    }

    /*
     * DELETE
     */
    public void delete(String id) {

        repository.deleteById(id);

        websocket.broadcast(
                "/topic/notifications",
                "NOTIFICATION_DELETED",
                id
        );
    }
}