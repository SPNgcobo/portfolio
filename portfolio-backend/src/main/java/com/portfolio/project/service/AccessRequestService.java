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

        this.auditLogService =
                auditLogService;

        this.notificationEventService =
                notificationEventService;
    }

    /*
     * CREATE REQUEST
     */
    public AccessRequest create(
            AccessRequest request
    ) {

        request.setStatus(
                AccessStatus.PENDING
        );

        request.setCreatedAt(
                new Date()
        );

        request.setUpdatedAt(
                new Date()
        );

        AccessRequest saved =
                repository.save(request);

        auditLogService.log(
                "ACCESS_REQUEST_CREATED",
                request.getEmail(),
                saved.getId(),
                "Vault access requested"
        );

        notificationEventService.broadcast(
                "ACCESS_REQUEST",
                "New vault access request"
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

        return repository.findByStatus(
                AccessStatus.PENDING
        );
    }

    /*
     * APPROVE
     */
    public AccessRequest approve(
            String id,
            String adminMessage
    ) {

        AccessRequest request =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Access request not found"
                                )
                        );

        request.setStatus(
                AccessStatus.APPROVED
        );

        request.setAdminMessage(
                adminMessage
        );

        request.setUpdatedAt(
                new Date()
        );

        AccessRequest updated =
                repository.save(request);

        auditLogService.log(
                "ACCESS_REQUEST_APPROVED",
                "ADMIN",
                updated.getId(),
                "Vault access approved"
        );

        notificationEventService.broadcast(
                "ACCESS_APPROVED",
                "Vault request approved"
        );

        return updated;
    }

    /*
     * REJECT
     */
    public AccessRequest reject(
            String id,
            String adminMessage
    ) {

        AccessRequest request =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Access request not found"
                                )
                        );

        request.setStatus(
                AccessStatus.REJECTED
        );

        request.setAdminMessage(
                adminMessage
        );

        request.setUpdatedAt(
                new Date()
        );

        AccessRequest updated =
                repository.save(request);

        auditLogService.log(
                "ACCESS_REQUEST_REJECTED",
                "ADMIN",
                updated.getId(),
                "Vault access rejected"
        );

        notificationEventService.broadcast(
                "ACCESS_REJECTED",
                "Vault request rejected"
        );

        return updated;
    }
}