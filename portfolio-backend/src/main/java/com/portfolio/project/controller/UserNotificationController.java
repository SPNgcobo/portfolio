package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.ActivityEvent;
import com.portfolio.project.service.NotificationEventService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications/user")
public class UserNotificationController {

    private final NotificationEventService notificationEventService;

    public UserNotificationController(NotificationEventService notificationEventService) {
        this.notificationEventService = notificationEventService;
    }

    // Get notifications for the current authenticated user
    @GetMapping("/me")
    public ApiResponse<List<ActivityEvent>> getUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return new ApiResponse<>(true, "User notifications fetched",
                notificationEventService.getNotificationsForUser(email));
    }

    // Get unread count for current user
    @GetMapping("/me/unread/count")
    public ApiResponse<Long> getUserUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return new ApiResponse<>(true, "User unread count fetched",
                notificationEventService.getUserUnreadCount(email));
    }

    // Mark all user notifications as read
    @PutMapping("/me/read/all")
    public ApiResponse<Void> markUserNotificationsAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        notificationEventService.markUserNotificationsAsRead(email);
        return new ApiResponse<>(true, "All notifications marked as read", null);
    }

    // Mark a single user notification as read
    @PutMapping("/me/{id}/read")
    public ApiResponse<Void> markUserNotificationAsRead(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        notificationEventService.markUserNotificationAsRead(id, email);
        return new ApiResponse<>(true, "Notification marked as read", null);
    }

    // Delete all user notifications
    @DeleteMapping("/me/all")
    public ApiResponse<Void> deleteAllUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        notificationEventService.deleteAllUserNotifications(email);
        return new ApiResponse<>(true, "All notifications deleted", null);
    }

    // Delete single user notification
    @DeleteMapping("/me/{id}")
    public ApiResponse<Void> deleteUserNotification(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        notificationEventService.deleteUserNotification(id, email);
        return new ApiResponse<>(true, "Notification deleted", null);
    }
}