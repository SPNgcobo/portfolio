package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.ContactMessageRequest;
import com.portfolio.project.service.AuditLogService;
import com.portfolio.project.service.EmailService;
import com.portfolio.project.service.NotificationEventService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    private final AuditLogService auditLogService;

    private final NotificationEventService notificationEventService;

    public ContactController(
            EmailService emailService,
            AuditLogService auditLogService,
            NotificationEventService notificationEventService
    ) {

        this.emailService = emailService;

        this.auditLogService =
                auditLogService;

        this.notificationEventService =
                notificationEventService;
    }

    /*
     * SEND CONTACT MESSAGE
     */
    @PostMapping
    public ApiResponse<Void> send(

            @RequestBody
            ContactMessageRequest request
    ) {

        /*
         * SEND TO ADMIN
         */
        emailService.sendContactEmail(
                request
        );

        /*
         * AUTO REPLY
         */
        emailService.sendAutoReply(
                request
        );

        /*
         * AUDIT
         */
        auditLogService.log(
                "CONTACT_MESSAGE",
                request.getEmail(),
                "Contact form submitted",
                null
        );

        notificationEventService.broadcast(
                "CONTACT_MESSAGE",
                "New contact message from " + request.getEmail() + " - Subject: " + request.getSubject()
        );

        return new ApiResponse<>(
                true,
                "Message sent successfully",
                null
        );
    }
}