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

    // CREATE
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

    // GET ACTIVE
    @GetMapping
    public ApiResponse<List<Notification>> getActive() {

        return new ApiResponse<>(
                true,
                "Notifications fetched",
                service.getActive()
        );
    }

    // DELETE
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