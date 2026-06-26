package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.ActivityEvent;
import com.portfolio.project.service.NotificationEventService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-events")
public class ActivityEventController {

    private final NotificationEventService notificationEventService;

    public ActivityEventController(NotificationEventService notificationEventService) {
        this.notificationEventService = notificationEventService;
    }

    // Admin endpoints
    @GetMapping
    public ApiResponse<List<ActivityEvent>> getAll() {
        return new ApiResponse<>(true, "Activity events fetched",
                notificationEventService.getAllActivityEvents());
    }

    // Get only admin events (excludes user notifications)
    @GetMapping("/admin")
    public ApiResponse<List<ActivityEvent>> getAdminEvents() {
        return new ApiResponse<>(true, "Admin activity events fetched",
                notificationEventService.getAdminActivityEvents());
    }

    @GetMapping("/unread/count")
    public ApiResponse<Long> getUnreadCount() {
        return new ApiResponse<>(true, "Unread count fetched",
                notificationEventService.getUnreadActivityCount());
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable String id) {
        notificationEventService.markActivityAsRead(id);
        return new ApiResponse<>(true, "Marked as read", null);
    }

    @PutMapping("/read/all")
    public ApiResponse<Void> markAllAsRead() {
        notificationEventService.markAllActivityAsRead();
        return new ApiResponse<>(true, "All marked as read", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteEvent(@PathVariable String id) {
        notificationEventService.deleteEvent(id);
        return new ApiResponse<>(true, "Event deleted", null);
    }

    @DeleteMapping("/read/all")
    public ApiResponse<Void> deleteAllRead() {
        notificationEventService.deleteAllRead();
        return new ApiResponse<>(true, "All read events deleted", null);
    }

    // User-specific endpoints (for regular users to manage their own notifications)
    @PutMapping("/user/{id}/read")
    public ApiResponse<Void> markUserNotificationAsRead(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        notificationEventService.markUserNotificationAsRead(id, email);
        return new ApiResponse<>(true, "Marked as read", null);
    }

    @DeleteMapping("/user/{id}")
    public ApiResponse<Void> deleteUserNotification(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        notificationEventService.deleteUserNotification(id, email);
        return new ApiResponse<>(true, "Deleted", null);
    }
}