package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.project.model.Comment;
import com.portfolio.project.repository.CommentRepository;
import com.portfolio.security.SpamProtectionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class CommentService {

    private final CommentRepository repository;

    private final ProjectService projectService;

    private final NotificationEventService notificationEventService;

    private final AuditLogService auditLogService;

    private final SpamProtectionService spamProtectionService;

    private final SimpMessagingTemplate messagingTemplate;

    private final EmailService emailService;

    public CommentService(
            CommentRepository repository,
            ProjectService projectService,
            NotificationEventService notificationEventService,
            AuditLogService auditLogService,
            SpamProtectionService spamProtectionService,
            SimpMessagingTemplate messagingTemplate,
            EmailService emailService
    ) {

        this.repository = repository;

        this.projectService = projectService;

        this.notificationEventService =
                notificationEventService;

        this.auditLogService =
                auditLogService;

        this.spamProtectionService =
                spamProtectionService;

        this.messagingTemplate =
                messagingTemplate;

        this.emailService = emailService;
    }

    /*
     * CREATE COMMENT
     */
    public Comment create(Comment comment, String ip) {
        boolean spam = spamProtectionService.isSpam(ip, comment.getContent());
        if (spam) {
            throw new RuntimeException("Duplicate/spam comment detected");
        }

        comment.setApproved(false);
        comment.setCreatedAt(new Date());
        Comment saved = repository.save(comment);
        projectService.incrementComments(comment.getProjectId());

        messagingTemplate.convertAndSend("/topic/comments", saved);
        notificationEventService.broadcast("NEW_COMMENT", "New comment awaiting moderation");

        // Wrap email in try-catch so it doesn't break the comment submission
        try {
            emailService.sendModerationAlert(
                    comment.getContent(),
                    comment.getEmail(),
                    "Project ID: " + comment.getProjectId()
            );
        } catch (Exception e) {
            log.error("Failed to send moderation alert email: {}", e.getMessage());
        }

        auditLogService.log("COMMENT_CREATED", comment.getUsername(), "Comment submitted", ip);
        return saved;
    }

    /*
     * GET APPROVED COMMENTS
     */
    public List<Comment> getApprovedComments(
            String projectId
    ) {

        return repository
                .findByProjectIdAndApprovedTrue(
                        projectId
                );
    }

    /*
     * GET PENDING COMMENTS
     */
    public List<Comment> getPendingComments() {

        return repository.findByApprovedFalse();
    }

    /*
     * APPROVE
     */
    public Comment approve(String id) {

        Comment comment =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Comment not found"
                                )
                        );

        comment.setApproved(true);

        Comment updated =
                repository.save(comment);

        messagingTemplate.convertAndSend(
                "/topic/comments",
                updated
        );

        notificationEventService.broadcast(
                "COMMENT_APPROVED",
                "Comment approved"
        );

        auditLogService.log(
                "COMMENT_APPROVED",
                "ADMIN",
                "Comment approved",
                "SYSTEM"
        );

        return updated;
    }

    /*
     * DELETE
     */
    public void delete(String id) {

        Comment comment =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Comment not found"
                                )
                        );

        repository.delete(comment);

        notificationEventService.broadcast(
                "COMMENT_DELETED",
                "Comment deleted"
        );

        auditLogService.log(
                "COMMENT_DELETED",
                "ADMIN",
                "Comment deleted",
                "SYSTEM"
        );
    }

    /*
     * ADMIN REPLY
     */
    public Comment adminReply(
            String parentId,
            Comment reply
    ) {

        Comment parent =
                repository.findById(parentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Parent comment not found"
                                )
                        );

        reply.setProjectId(
                parent.getProjectId()
        );

        reply.setParentCommentId(
                parentId
        );

        reply.setAdminReply(true);

        reply.setApproved(true);

        reply.setCreatedAt(new Date());

        Comment saved =
                repository.save(reply);

        messagingTemplate.convertAndSend(
                "/topic/comments",
                saved
        );

        notificationEventService.broadcast(
                "ADMIN_REPLY",
                "Admin replied to comment"
        );

        auditLogService.log(
                "ADMIN_REPLY",
                "ADMIN",
                saved.getId(),
                "Admin replied to comment"
        );

        return saved;
    }
}