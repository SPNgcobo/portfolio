package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.ContactMessageRequest;
import com.portfolio.project.service.AuditLogService;
import com.portfolio.project.service.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final EmailService emailService;

    private final AuditLogService auditLogService;

    public ContactController(
            EmailService emailService,
            AuditLogService auditLogService
    ) {

        this.emailService = emailService;

        this.auditLogService =
                auditLogService;
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

        return new ApiResponse<>(
                true,
                "Message sent successfully",
                null
        );
    }
}