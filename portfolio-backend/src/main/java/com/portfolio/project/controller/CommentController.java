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
@CrossOrigin(origins = "*")
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
            @PathVariable String id
    ) {

        service.delete(id);

        return new ApiResponse<>(
                true,
                "Comment deleted",
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

        return new ApiResponse<>(
                true,
                "Admin reply submitted",
                service.adminReply(id, reply)
        );
    }
}