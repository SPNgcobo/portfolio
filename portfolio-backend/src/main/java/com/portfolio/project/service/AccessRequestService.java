package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.model.AccessRequestType;
import com.portfolio.project.model.AccessStatus;
import com.portfolio.project.model.Media;
import com.portfolio.project.repository.AccessRequestRepository;
import com.portfolio.project.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AccessRequestService {

    private final AccessRequestRepository repository;
    private final AuditLogService auditLogService;
    private final NotificationEventService notificationEventService;
    private final MediaRepository mediaRepository;

    public AccessRequestService(
            AccessRequestRepository repository,
            AuditLogService auditLogService,
            NotificationEventService notificationEventService,
            MediaRepository mediaRepository
    ) {
        this.repository = repository;
        this.auditLogService = auditLogService;
        this.notificationEventService = notificationEventService;
        this.mediaRepository = mediaRepository;
    }

    /*
     * Normalize email: trim and lowercase
     */
    private String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }

    /*
     * CREATE REQUEST - Supports both project-based and media-based requests
     */
    public AccessRequest create(AccessRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        request.setEmail(normalizedEmail);

        if (request.getProjectId() != null && request.getProjectId().trim().isEmpty()) {
            request.setProjectId(null);
        }
        if (request.getMediaId() != null && request.getMediaId().trim().isEmpty()) {
            request.setMediaId(null);
        }

        if (request.getMediaId() != null && !request.getMediaId().isBlank()) {
            request.setRequestType(AccessRequestType.MEDIA);

            List<AccessRequest> existingRequests = repository.findAllByEmailAndMediaId(normalizedEmail, request.getMediaId());

            for (AccessRequest existing : existingRequests) {
                AccessStatus existingStatus = existing.getStatus();
                if (existingStatus == AccessStatus.PENDING) {
                    throw new IllegalStateException("You already have a pending access request for this media");
                }
                if (existingStatus == AccessStatus.APPROVED) {
                    throw new IllegalStateException("You already have approved access to this media");
                }
            }

            Media media = mediaRepository.findById(request.getMediaId()).orElse(null);
            if (media != null && media.getProjectId() != null && !media.getProjectId().isBlank()) {
                request.setProjectId(media.getProjectId());
            }

        } else if (request.getProjectId() != null && !request.getProjectId().isBlank()) {
            request.setRequestType(AccessRequestType.PROJECT);

            AccessRequest existing = repository
                    .findByEmailAndProjectId(normalizedEmail, request.getProjectId())
                    .orElse(null);

            if (existing != null) {
                AccessStatus existingStatus = existing.getStatus();
                if (existingStatus == AccessStatus.PENDING) {
                    throw new IllegalStateException("You already have a pending access request for this project");
                }
                if (existingStatus == AccessStatus.APPROVED) {
                    throw new IllegalStateException("You already have approved access to this project");
                }
            }

        } else {
            throw new IllegalArgumentException("Either projectId or mediaId must be provided");
        }

        request.setStatus(AccessStatus.PENDING);
        request.setCreatedAt(new Date());
        request.setUpdatedAt(new Date());

        AccessRequest saved = repository.save(request);

        String targetType = request.getRequestType() == AccessRequestType.PROJECT ? "project" : "media";
        String targetId = request.getRequestType() == AccessRequestType.PROJECT ?
                request.getProjectId() : request.getMediaId();

        auditLogService.log(
                "ACCESS_REQUEST_CREATED",
                request.getEmail(),
                saved.getId(),
                "Access requested for " + targetType + ": " + targetId
        );

        notificationEventService.broadcast(
                "ACCESS_REQUEST",
                "New access request from " + request.getEmail() + " for " + targetType + ": " + targetId
        );

        notificationEventService.notifyAdmin(
                "ACCESS_REQUEST",
                "🔐 New access request from " + request.getName() + " (" + request.getEmail() +
                        ")\nType: " + request.getRequestType() +
                        "\nTarget: " + targetId +
                        "\n\nReason: " + request.getReason()
        );

        return saved;
    }

    /*
     * GET ALL REQUESTS
     */
    public List<AccessRequest> getAll() {
        return repository.findAll();
    }

    /*
     * GET PENDING REQUESTS
     */
    public List<AccessRequest> getPending() {
        return repository.findByStatus(AccessStatus.PENDING);
    }

    /*
     * GET REQUESTS BY USER EMAIL
     */
    public List<AccessRequest> getRequestsByUser(String email) {
        return repository.findByEmail(normalizeEmail(email));
    }

    /*
     * GET USER'S REQUEST FOR A SPECIFIC PROJECT
     */
    public AccessRequest getRequestByUserAndProject(String email, String projectId) {
        return repository
                .findByEmailAndProjectId(normalizeEmail(email), projectId)
                .orElse(null);
    }

    /*
     * GET USER'S REQUEST FOR A SPECIFIC MEDIA
     */
    public AccessRequest getRequestByUserAndMedia(String email, String mediaId) {
        return repository
                .findByEmailAndMediaId(normalizeEmail(email), mediaId)
                .orElse(null);
    }

    /*
     * CHECK IF USER HAS APPROVED ACCESS TO A PROJECT
     */
    public boolean hasApprovedProjectAccess(String email, String projectId) {
        if (email == null || projectId == null) {
            return false;
        }
        String normalizedEmail = normalizeEmail(email);
        return repository.hasApprovedProjectAccess(normalizedEmail, projectId);
    }

    /*
     * CHECK IF USER HAS APPROVED ACCESS TO A MEDIA
     */
    public boolean hasApprovedMediaAccess(String email, String mediaId) {
        if (email == null || mediaId == null) {
            return false;
        }
        String normalizedEmail = normalizeEmail(email);
        return repository.hasApprovedMediaAccess(normalizedEmail, mediaId);
    }

    /*
     * CHECK IF USER HAS ACCESS TO A MEDIA (via project or direct media access)
     */
    public boolean hasAccessToMedia(String email, String mediaId) {
        if (email == null || mediaId == null) {
            return false;
        }

        String normalizedEmail = normalizeEmail(email);

        if (repository.hasApprovedMediaAccess(normalizedEmail, mediaId)) {
            return true;
        }

        Media media = mediaRepository.findById(mediaId).orElse(null);
        if (media != null && media.getProjectId() != null && !media.getProjectId().isBlank()) {
            return repository.hasApprovedProjectAccess(normalizedEmail, media.getProjectId());
        }

        return false;
    }

    /*
     * APPROVE
     */
    public AccessRequest approve(String id, String adminMessage) {
        AccessRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));

        if (request.getStatus() == AccessStatus.APPROVED) {
            throw new IllegalStateException("This request is already approved");
        }

        request.setStatus(AccessStatus.APPROVED);
        request.setAdminMessage(adminMessage);
        request.setUpdatedAt(new Date());

        AccessRequest updated = repository.save(request);

        String targetType = request.getRequestType() == AccessRequestType.PROJECT ? "project" : "media";
        String targetId = request.getRequestType() == AccessRequestType.PROJECT ?
                request.getProjectId() : request.getMediaId();

        auditLogService.log(
                "ACCESS_REQUEST_APPROVED",
                "ADMIN",
                updated.getId(),
                "Access approved for " + targetType + ": " + targetId
        );

        notificationEventService.broadcast(
                "ACCESS_APPROVED",
                "Access request approved for " + request.getEmail()
        );

        notificationEventService.notifyUser(
                request.getEmail(),
                request.getName(),
                "ACCESS_APPROVED",
                "✅ Your access request has been approved! You can now access the requested content.",
                request.getRequestType() == AccessRequestType.PROJECT ?
                        "/projects/" + request.getProjectId() : "/vault",
                request.getId()
        );

        return updated;
    }

    /*
     * REJECT
     */
    public AccessRequest reject(String id, String adminMessage) {
        AccessRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));

        if (request.getStatus() == AccessStatus.REJECTED) {
            throw new IllegalStateException("This request is already rejected");
        }

        request.setStatus(AccessStatus.REJECTED);
        request.setAdminMessage(adminMessage);
        request.setUpdatedAt(new Date());

        AccessRequest updated = repository.save(request);

        String targetType = request.getRequestType() == AccessRequestType.PROJECT ? "project" : "media";
        String targetId = request.getRequestType() == AccessRequestType.PROJECT ?
                request.getProjectId() : request.getMediaId();

        auditLogService.log(
                "ACCESS_REQUEST_REJECTED",
                "ADMIN",
                updated.getId(),
                "Access rejected for " + targetType + ": " + targetId
        );

        notificationEventService.broadcast(
                "ACCESS_REJECTED",
                "Access request rejected for " + request.getEmail()
        );

        notificationEventService.notifyUser(
                request.getEmail(),
                request.getName(),
                "ACCESS_REJECTED",
                "❌ Your access request has been rejected. Reason: " + (adminMessage != null ? adminMessage : "No reason provided"),
                request.getRequestType() == AccessRequestType.PROJECT ?
                        "/projects/" + request.getProjectId() : "/vault",
                request.getId()
        );

        return updated;
    }
}