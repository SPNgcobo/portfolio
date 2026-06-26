package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.model.AccessStatus;
import com.portfolio.project.repository.AccessRequestRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AccessRequestService {

    private final AccessRequestRepository repository;
    private final AuditLogService auditLogService;
    private final NotificationEventService notificationEventService;

    public AccessRequestService(
            AccessRequestRepository repository,
            AuditLogService auditLogService,
            NotificationEventService notificationEventService
    ) {
        this.repository = repository;
        this.auditLogService = auditLogService;
        this.notificationEventService = notificationEventService;
    }

    /*
     * CREATE REQUEST
     */
    public AccessRequest create(AccessRequest request) {
        request.setStatus(AccessStatus.PENDING);
        request.setCreatedAt(new Date());
        request.setUpdatedAt(new Date());

        AccessRequest saved = repository.save(request);

        auditLogService.log("ACCESS_REQUEST_CREATED", request.getEmail(), saved.getId(), "Vault access requested");
        notificationEventService.broadcast(
                "ACCESS_REQUEST",
                "New vault access request from " + request.getEmail()
        );

        return saved;
    }

    /*
     * GET ALL
     */
    public List<AccessRequest> getAll() {
        return repository.findAll();
    }

    /*
     * GET PENDING
     */
    public List<AccessRequest> getPending() {
        return repository.findByStatus(AccessStatus.PENDING);
    }

    /*
     * APPROVE - Notify the requester with target URL
     */
    public AccessRequest approve(String id, String adminMessage) {
        AccessRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));

        request.setStatus(AccessStatus.APPROVED);
        request.setAdminMessage(adminMessage);
        request.setUpdatedAt(new Date());

        AccessRequest updated = repository.save(request);

        auditLogService.log("ACCESS_REQUEST_APPROVED", "ADMIN", updated.getId(), "Vault access approved");

        notificationEventService.broadcast(
                "ACCESS_APPROVED",
                "Access request approved for " + request.getEmail()
        );

        notificationEventService.notifyUser(
                request.getEmail(),
                request.getName(),
                "ACCESS_APPROVED",
                "Your access request has been approved! You can now access the requested content.",
                "/access-requests",
                request.getId()
        );

        return updated;
    }

    /*
     * REJECT - Notify the requester with target URL
     */
    public AccessRequest reject(String id, String adminMessage) {
        AccessRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));

        request.setStatus(AccessStatus.REJECTED);
        request.setAdminMessage(adminMessage);
        request.setUpdatedAt(new Date());

        AccessRequest updated = repository.save(request);

        auditLogService.log("ACCESS_REQUEST_REJECTED", "ADMIN", updated.getId(), "Vault access rejected");

        notificationEventService.broadcast(
                "ACCESS_REJECTED",
                "Access request rejected for " + request.getEmail()
        );

        notificationEventService.notifyUser(
                request.getEmail(),
                request.getName(),
                "ACCESS_REJECTED",
                "Your access request has been rejected. Reason: " + adminMessage,
                "/access-requests",
                request.getId()
        );

        return updated;
    }
}