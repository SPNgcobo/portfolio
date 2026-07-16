package com.portfolio.project.service;

import com.portfolio.project.model.ActivityEvent;
import com.portfolio.project.repository.ActivityEventRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationEventService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ActivityEventRepository activityEventRepository;

    public NotificationEventService(
            SimpMessagingTemplate messagingTemplate,
            ActivityEventRepository activityEventRepository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.activityEventRepository = activityEventRepository;
    }

    /*
     * REALTIME EVENT (Admin-only - shows in Recent Activity)
     */
    public void broadcast(String type, String message) {
        ActivityEvent event = new ActivityEvent();
        event.setType(type);
        event.setMessage(message);
        event.setCreatedAt(new Date());
        event.setRead(false);
        event.setUserNotification(false);
        activityEventRepository.save(event);

        Map<String, String> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        messagingTemplate.convertAndSend("/topic/admin-events", payload);
        messagingTemplate.convertAndSend("/topic/activity", payload);
    }

    /*
     * Broadcast Activity Only (for admin dashboard)
     */
    public void broadcastActivity(String type, String message) {
        Map<String, String> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        messagingTemplate.convertAndSend("/topic/activity", payload);
    }

    /*
     * ADMIN NOTIFICATION (shows in admin's Recent Activity)
     */
    public void notifyAdmin(String type, String message) {
        ActivityEvent event = new ActivityEvent();
        event.setType(type);
        event.setMessage(message);
        event.setCreatedAt(new Date());
        event.setRead(false);
        event.setUserNotification(false);
        activityEventRepository.save(event);

        Map<String, String> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        messagingTemplate.convertAndSend("/topic/admin-events", payload);
        messagingTemplate.convertAndSend("/topic/activity", payload);
    }

    /*
     * USER-SPECIFIC NOTIFICATION with target URL and target ID
     */
    public void notifyUser(String userId, String userName, String type, String message, String targetUrl, String targetId) {
        ActivityEvent event = new ActivityEvent();
        event.setType(type);
        event.setMessage(message);
        event.setUserId(userId);
        event.setUserName(userName);
        event.setTargetUrl(targetUrl);
        event.setTargetId(targetId);
        event.setCreatedAt(new Date());
        event.setRead(false);
        event.setUserNotification(true);
        activityEventRepository.save(event);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        payload.put("userId", userId);
        payload.put("userName", userName);
        payload.put("targetUrl", targetUrl);
        payload.put("targetId", targetId);

        messagingTemplate.convertAndSendToUser(userId, "/topic/notifications", payload);

        Map<String, String> activityPayload = new HashMap<>();
        activityPayload.put("type", type);
        activityPayload.put("message", message);
        messagingTemplate.convertAndSend("/topic/activity", activityPayload);
    }

    public void notifyUser(String userId, String userName, String type, String message) {
        notifyUser(userId, userName, type, message, null, null);
    }

    /*
     * GET ALL ACTIVITY EVENTS (ADMIN)
     */
    public List<ActivityEvent> getAllActivityEvents() {
        return activityEventRepository.findAllByOrderByCreatedAtDesc();
    }

    /*
     * GET ADMIN-SPECIFIC ACTIVITY EVENTS
     */
    public List<ActivityEvent> getAdminActivityEvents() {
        return activityEventRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(event -> !event.isUserNotification())
                .toList();
    }

    /*
     * GET USER-SPECIFIC NOTIFICATIONS
     */
    public List<ActivityEvent> getNotificationsForUser(String userId) {
        return activityEventRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /*
     * GET UNREAD COUNT
     */
    public long getUnreadActivityCount() {
        return activityEventRepository.countByReadFalse();
    }

    /*
     * GET USER UNREAD COUNT
     */
    public long getUserUnreadCount(String userId) {
        return activityEventRepository.countByUserIdAndReadFalse(userId);
    }

    /*
     * MARK AS READ
     */
    public void markActivityAsRead(String id) {
        activityEventRepository.findById(id).ifPresent(event -> {
            event.setRead(true);
            activityEventRepository.save(event);
        });
    }

    /*
     * MARK ALL AS READ
     */
    public void markAllActivityAsRead() {
        List<ActivityEvent> unread = activityEventRepository.findByReadFalse();
        if (unread != null && !unread.isEmpty()) {
            unread.forEach(event -> event.setRead(true));
            activityEventRepository.saveAll(unread);
        }
    }

    /*
     * MARK USER NOTIFICATIONS AS READ
     */
    public void markUserNotificationsAsRead(String userId) {
        List<ActivityEvent> unread = activityEventRepository.findByUserIdAndReadFalse(userId);
        if (unread != null && !unread.isEmpty()) {
            unread.forEach(event -> event.setRead(true));
            activityEventRepository.saveAll(unread);
        }
    }

    /*
     * MARK USER NOTIFICATION AS READ (single)
     */
    public void markUserNotificationAsRead(String id, String userId) {
        activityEventRepository.findById(id).ifPresent(event -> {
            if (event.getUserId() != null && event.getUserId().equals(userId)) {
                event.setRead(true);
                activityEventRepository.save(event);
            }
        });
    }

    /*
     * DELETE USER NOTIFICATION (single)
     */
    public void deleteUserNotification(String id, String userId) {
        activityEventRepository.findById(id).ifPresent(event -> {
            if (event.getUserId() != null && event.getUserId().equals(userId) && event.isUserNotification()) {
                activityEventRepository.delete(event);
            }
        });
    }

    /*
     * DELETE ALL USER NOTIFICATIONS
     */
    public void deleteAllUserNotifications(String userId) {
        List<ActivityEvent> userEvents = activityEventRepository.findByUserIdAndUserNotificationTrue(userId);
        if (userEvents != null && !userEvents.isEmpty()) {
            activityEventRepository.deleteAll(userEvents);
        }
    }

    public void deleteEvent(String id) {
        activityEventRepository.deleteById(id);
    }

    public void deleteAllRead() {
        List<ActivityEvent> readEvents = activityEventRepository.findByReadTrue();
        if (readEvents != null && !readEvents.isEmpty()) {
            activityEventRepository.deleteAll(readEvents);
        }
    }
}