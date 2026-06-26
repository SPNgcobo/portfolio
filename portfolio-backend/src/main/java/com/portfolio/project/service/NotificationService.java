package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
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
     * GET ALL NOTIFICATIONS (ADMIN)
     */
    public List<Notification> getAll() {
        return repository.findAll();
    }

    /*
     * GET ACTIVE NOTIFICATIONS
     */
    public List<Notification> getActive() {
        return repository.findByActiveTrue();
    }

    /*
     * CREATE
     */
    public Notification create(Notification notification) {
        notification.setCreatedAt(new Date());
        Notification saved = repository.save(notification);

        websocket.broadcast(
                "/topic/notifications",
                "NOTIFICATION_CREATED",
                saved
        );

        return saved;
    }

    /*
     * UPDATE
     */
    public Notification update(String id, Notification updatedNotification) {
        Notification existing = getById(id);
        existing.setTitle(updatedNotification.getTitle());
        existing.setMessage(updatedNotification.getMessage());
        existing.setType(updatedNotification.getType());
        existing.setActive(updatedNotification.isActive());
        return repository.save(existing);
    }

    /*
     * TOGGLE ACTIVE STATUS
     */
    public Notification toggleActive(String id) {
        Notification notification = getById(id);
        notification.setActive(!notification.isActive());
        Notification saved = repository.save(notification);

        websocket.broadcast(
                "/topic/notifications",
                "NOTIFICATION_TOGGLED",
                saved
        );

        return saved;
    }

    /*
     * DELETE
     */
    public void delete(String id) {
        Notification notification = getById(id);
        repository.delete(notification);

        websocket.broadcast(
                "/topic/notifications",
                "NOTIFICATION_DELETED",
                id
        );
    }

    /*
     * GET BY ID
     */
    private Notification getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }
}