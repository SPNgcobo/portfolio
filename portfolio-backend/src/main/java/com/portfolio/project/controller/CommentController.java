package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Comment;
import com.portfolio.project.service.CommentService;
import com.portfolio.security.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService service;

    private final RateLimitService rateLimitService;

    public CommentController(
            CommentService service,
            RateLimitService rateLimitService
    ) {

        this.service = service;

        this.rateLimitService =
                rateLimitService;
    }

    /*
     * CREATE COMMENT
     */
    @PostMapping
    public ApiResponse<Comment> create(
            @RequestBody Comment comment,
            HttpServletRequest request
    ) {

        String ip =
                request.getRemoteAddr();

        /*
         * RATE LIMIT
         */
        boolean allowed =
                rateLimitService.isAllowed(ip);

        if (!allowed) {

            throw new RuntimeException(
                    "Too many requests"
            );
        }

        return new ApiResponse<>(
                true,
                "Comment submitted for moderation",
                service.create(comment, ip)
        );
    }

    /*
     * PROJECT COMMENTS
     */
    @GetMapping("/project/{projectId}")
    public ApiResponse<List<Comment>>
    getProjectComments(
            @PathVariable String projectId
    ) {

        return new ApiResponse<>(
                true,
                "Comments fetched successfully",
                service.getApprovedComments(
                        projectId
                )
        );
    }

    /*
     * PENDING COMMENTS
     */
    @GetMapping("/pending")
    public ApiResponse<List<Comment>>
    getPending() {

        return new ApiResponse<>(
                true,
                "Pending comments fetched",
                service.getPendingComments()
        );
    }

    /*
     * APPROVE
     */
    @PutMapping("/{id}/approve")
    public ApiResponse<Comment> approve(
            @PathVariable String id
    ) {

        return new ApiResponse<>(
                true,
                "Comment approved",
                service.approve(id)
        );
    }

    /*
     * DELETE
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        String email = request.getParameter("email");
        service.delete(id, email);
        return new ApiResponse<>(
                true,
                "Comment deleted",
                null
        );
    }

    /*
     * ADMIN DELETE
     */
    @DeleteMapping("/admin/{id}")
    public ApiResponse<Void> adminDelete(
            @PathVariable String id
    ) {

        service.adminDelete(id);
        return new ApiResponse<>(
                true,
                "Comment deleted by admin",
                null
        );
    }

    /*
     * ADMIN REPLY
     */
    @PostMapping("/{id}/reply")
    public ApiResponse<Comment> reply(
            @PathVariable String id,
            @RequestBody Comment reply
    ) {

        // Ensure admin reply is always approved
        reply.setApproved(true);
        reply.setAdminReply(true);
        return new ApiResponse<>(
                true,
                "Admin reply submitted",
                service.adminReply(id, reply)
        );
    }

    /*
     * ADMIN - ALL COMMENTS
     */
    @GetMapping("/all")
    public ApiResponse<List<Comment>> getAll() {
        return new ApiResponse<>(
                true,
                "All comments fetched",
                service.getAllComments()
        );
    }

    /*
     * EDIT COMMENT - Users can edit their own comments
     */
    @PutMapping("/{id}/edit")
    public ApiResponse<Comment> editComment(
            @PathVariable String id,
            @RequestBody Comment updatedComment,
            HttpServletRequest request
    ) {

        String email = request.getParameter("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required to edit comment");
        }

        return new ApiResponse<>(
                true,
                "Comment updated",
                service.editComment(id, updatedComment.getContent(), email)
        );
    }

    /*
     * ADMIN EDIT COMMENT - Admin can edit any comment
     */
    @PutMapping("/admin/{id}/edit")
    public ApiResponse<Comment> adminEditComment(
            @PathVariable String id,
            @RequestBody Comment updatedComment
    ) {

        return new ApiResponse<>(
                true,
                "Comment updated by admin",
                service.adminEditComment(id, updatedComment.getContent())
        );
    }
}