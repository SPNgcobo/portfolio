package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Notification;
import com.portfolio.project.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    // GET ALL NOTIFICATIONS (ADMIN)
    @GetMapping
    public ApiResponse<List<Notification>> getAllNotifications() {
        return new ApiResponse<>(
                true,
                "All notifications fetched",
                service.getAll()
        );
    }

    // GET ACTIVE NOTIFICATIONS (PUBLIC)
    @GetMapping("/active")
    public ApiResponse<List<Notification>> getActiveNotifications() {
        return new ApiResponse<>(
                true,
                "Active notifications fetched",
                service.getActive()
        );
    }

    // CREATE NOTIFICATION
    @PostMapping
    public ApiResponse<Notification> create(
            @RequestBody Notification notification
    ) {
        return new ApiResponse<>(
                true,
                "Notification created",
                service.create(notification)
        );
    }

    // UPDATE NOTIFICATION
    @PutMapping("/{id}")
    public ApiResponse<Notification> update(
            @PathVariable String id,
            @RequestBody Notification notification
    ) {
        return new ApiResponse<>(
                true,
                "Notification updated",
                service.update(id, notification)
        );
    }

    // TOGGLE NOTIFICATION ACTIVE STATUS
    @PutMapping("/{id}/toggle")
    public ApiResponse<Notification> toggle(
            @PathVariable String id
    ) {
        return new ApiResponse<>(
                true,
                "Notification toggled",
                service.toggleActive(id)
        );
    }

    // DELETE NOTIFICATION
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable String id
    ) {
        service.delete(id);
        return new ApiResponse<>(
                true,
                "Notification deleted",
                null
        );
    }
}