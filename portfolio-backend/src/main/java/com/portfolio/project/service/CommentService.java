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
        this.notificationEventService = notificationEventService;
        this.auditLogService = auditLogService;
        this.spamProtectionService = spamProtectionService;
        this.messagingTemplate = messagingTemplate;
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

        boolean isAdmin = comment.isAdminReply()
                || "admin@portfolio.com".equals(comment.getEmail())
                || "Admin".equals(comment.getUsername());

        // Default values
        comment.setApproved(isAdmin);
        comment.setCreatedAt(new Date());
        comment.setEdited(false);
        comment.setEditCount(0);
        comment.setDeleted(false);
        comment.setDeletedAt(null);

        Comment saved = repository.save(comment);

        projectService.incrementComments(comment.getProjectId());

        messagingTemplate.convertAndSend("/topic/comments", saved);

        if (!isAdmin) {
            notificationEventService.notifyAdmin(
                    "NEW_COMMENT",
                    "New comment from " + comment.getUsername() + " on project: \"" + comment.getContent() + "\""
            );

            try {
                emailService.sendModerationAlert(
                        comment.getContent(),
                        comment.getEmail(),
                        "Project ID: " + comment.getProjectId()
                );
            } catch (Exception e) {
                log.error("Failed to send moderation alert email: {}", e.getMessage());
            }
        } else {
            if (comment.getParentCommentId() != null) {
                repository.findById(comment.getParentCommentId()).ifPresent(parent -> {
                    notificationEventService.notifyUser(
                            parent.getEmail(),
                            parent.getUsername(),
                            "ADMIN_REPLY",
                            "Admin replied to your comment: \"" + comment.getContent() + "\"",
                            "/projects/" + parent.getProjectId(),
                            parent.getId()
                    );
                });
            }
        }

        auditLogService.log("COMMENT_CREATED", comment.getUsername(), "Comment submitted", ip);
        return saved;
    }

    /*
     * GET APPROVED COMMENTS
     */
    public List<Comment> getApprovedComments(String projectId) {
        return repository.findByProjectIdAndApprovedTrueOrderByCreatedAtAsc(projectId);
    }

    /*
     * GET PENDING COMMENTS
     */
    public List<Comment> getPendingComments() {
        return repository.findByApprovedFalseAndDeletedFalse();
    }

    /*
     * ADMIN - ALL COMMENTS
     */
    public List<Comment> getAllComments() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    /*
     * APPROVE
     */
    public Comment approve(String id) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        comment.setApproved(true);
        Comment updated = repository.save(comment);

        messagingTemplate.convertAndSend("/topic/comments", updated);

        String userIdentifier = comment.getUsername();
        if (userIdentifier == null || userIdentifier.isBlank()) {
            userIdentifier = comment.getEmail();
        }

        notificationEventService.notifyAdmin(
                "COMMENT_APPROVED",
                "You approved " + userIdentifier + "'s comment: \"" + comment.getContent() + "\""
        );

        notificationEventService.notifyUser(
                comment.getEmail(),
                comment.getUsername(),
                "COMMENT_APPROVED",
                "Your comment \"" + comment.getContent() + "\" has been approved!",
                "/projects/" + comment.getProjectId(),
                comment.getId()
        );

        auditLogService.log("COMMENT_APPROVED", "ADMIN", "Comment approved", "SYSTEM");

        return updated;
    }

    /*
     * DELETE COMMENT (USER SOFT DELETE)
     */
    public void delete(String id, String email) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required to delete comment");
        }

        if (!comment.getEmail().equals(email)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        if (comment.isDeleted()) {
            return;
        }

        comment.setDeleted(true);
        comment.setDeletedAt(new Date());
        // Set who deleted it (the user who owns the comment)
        comment.setDeletedBy(comment.getUsername());

        repository.save(comment);

        notificationEventService.broadcastActivity(
                "COMMENT_DELETED",
                "Comment deleted by " + getCommentOwnerDisplayName(comment)
        );

        auditLogService.log(
                "COMMENT_DELETED",
                getCommentOwnerDisplayName(comment),
                "Comment soft deleted by owner",
                email
        );

        messagingTemplate.convertAndSend("/topic/comments", comment);
    }

    /*
     * ADMIN DELETE COMMENT (NOW SOFT DELETE TOO)
     */
    public void adminDelete(String id) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (comment.isDeleted()) {
            return;
        }

        comment.setDeleted(true);
        comment.setDeletedAt(new Date());
        // Set who deleted it (Admin)
        comment.setDeletedBy("Admin");

        repository.save(comment);

        notificationEventService.broadcastActivity(
                "COMMENT_DELETED",
                "Comment deleted by admin"
        );

        auditLogService.log(
                "COMMENT_DELETED",
                "ADMIN",
                "Comment soft deleted by admin",
                "ADMIN"
        );

        messagingTemplate.convertAndSend("/topic/comments", comment);
    }

    /*
     * EDIT COMMENT (User can edit their own comment)
     * When user edits, comment goes back to pending moderation
     */
    public Comment editComment(String id, String newContent, String email) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email is required to edit comment");
        }

        if (!comment.getEmail().equals(email)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        if (!comment.isEdited()) {
            comment.setOriginalContent(comment.getContent());
        }

        comment.setContent(newContent);
        comment.setEdited(true);
        comment.setEditedAt(new Date());
        comment.setEditCount(comment.getEditCount() + 1);

        // User edits must be re-approved
        comment.setApproved(false);

        Comment updated = repository.save(comment);

        messagingTemplate.convertAndSend("/topic/comments", updated);

        String originalContent = comment.getOriginalContent() != null
                ? comment.getOriginalContent()
                : "No original version saved";

        String notificationMessage = String.format(
                "✏️ Comment edited by %s\n\n📄 Original: \"%s\"\n\n✏️ Edited: \"%s\"",
                comment.getUsername(),
                originalContent,
                newContent
        );

        notificationEventService.notifyAdmin("COMMENT_EDITED", notificationMessage);

        notificationEventService.broadcastActivity(
                "COMMENT_EDITED",
                "Comment edited by " + comment.getUsername() + " - pending moderation"
        );

        auditLogService.log(
                "COMMENT_EDITED",
                comment.getUsername(),
                "Comment edited - pending moderation. Original: " + originalContent,
                "USER"
        );

        return updated;
    }

    /*
     * ADMIN EDIT COMMENT
     */
    public Comment adminEditComment(String id, String newContent) {
        Comment comment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.isEdited()) {
            comment.setOriginalContent(comment.getContent());
        }

        comment.setContent(newContent);
        comment.setEdited(true);
        comment.setEditedAt(new Date());
        comment.setEditCount(comment.getEditCount() + 1);
        comment.setApproved(true);

        Comment updated = repository.save(comment);

        messagingTemplate.convertAndSend("/topic/comments", updated);

        String originalContent = comment.getOriginalContent() != null
                ? comment.getOriginalContent()
                : "No original version saved";

        notificationEventService.notifyAdmin(
                "COMMENT_EDITED",
                "✏️ You edited " + comment.getUsername() + "'s comment\n\n📄 Original: \"" + originalContent + "\"\n\n✏️ Edited: \"" + newContent + "\""
        );

        auditLogService.log(
                "COMMENT_EDITED",
                "ADMIN",
                "Comment edited by admin. Original: " + originalContent,
                "ADMIN"
        );

        return updated;
    }

    /*
     * ADMIN REPLY
     */
    public Comment adminReply(String parentId, Comment reply) {
        Comment parent = repository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));

        reply.setProjectId(parent.getProjectId());
        reply.setParentCommentId(parentId);
        reply.setAdminReply(true);
        reply.setApproved(true);
        reply.setCreatedAt(new Date());
        reply.setEdited(false);
        reply.setEditCount(0);
        reply.setDeleted(false);
        reply.setDeletedAt(null);

        Comment saved = repository.save(reply);

        messagingTemplate.convertAndSend("/topic/comments", saved);

        String userIdentifier = parent.getUsername();
        if (userIdentifier == null || userIdentifier.isBlank()) {
            userIdentifier = parent.getEmail();
        }

        notificationEventService.notifyAdmin(
                "ADMIN_REPLY",
                "You replied to " + userIdentifier + "'s comment: \"" + reply.getContent() + "\""
        );

        notificationEventService.notifyUser(
                parent.getEmail(),
                parent.getUsername(),
                "ADMIN_REPLY",
                "Admin replied to your comment: \"" + reply.getContent() + "\"",
                "/projects/" + parent.getProjectId(),
                parent.getId()
        );

        auditLogService.log(
                "ADMIN_REPLY",
                "ADMIN",
                saved.getId(),
                "Admin replied to comment from " + parent.getUsername()
        );

        return saved;
    }

    /*
     * Helper: display name for notifications / logs
     */
    private String getCommentOwnerDisplayName(Comment comment) {
        if (comment == null) {
            return "User";
        }

        if (comment.isAdminReply()
                || "admin@portfolio.com".equalsIgnoreCase(comment.getEmail())
                || "Admin".equalsIgnoreCase(comment.getUsername())) {
            return "Admin";
        }

        if (comment.getUsername() != null && !comment.getUsername().isBlank()) {
            return comment.getUsername();
        }

        if (comment.getEmail() != null && !comment.getEmail().isBlank()) {
            return comment.getEmail();
        }

        return "User";
    }
}