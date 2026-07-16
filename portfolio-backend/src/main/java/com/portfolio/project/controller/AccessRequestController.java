package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.AccessDecisionRequest;
import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.service.AccessRequestService;
import com.portfolio.security.CurrentUserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    private final AccessRequestService service;
    private final CurrentUserService currentUserService;

    public AccessRequestController(
            AccessRequestService service,
            CurrentUserService currentUserService
    ) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    /*
     * CREATE REQUEST - User must be authenticated
     */
    @PostMapping
    public ApiResponse<AccessRequest> create(
            @RequestBody AccessRequest request
    ) {
        return new ApiResponse<>(
                true,
                "Access request submitted",
                service.create(request)
        );
    }

    /*
     * GET ALL REQUESTS (ADMIN ONLY)
     */
    @GetMapping
    public ApiResponse<List<AccessRequest>> getAll() {
        return new ApiResponse<>(
                true,
                "Access requests fetched",
                service.getAll()
        );
    }

    /*
     * GET PENDING REQUESTS (ADMIN ONLY)
     */
    @GetMapping("/pending")
    public ApiResponse<List<AccessRequest>> getPending() {
        return new ApiResponse<>(
                true,
                "Pending requests fetched",
                service.getPending()
        );
    }

    /*
     * GET CURRENT USER'S REQUESTS
     */
    @GetMapping("/user/me")
    public ApiResponse<List<AccessRequest>> getUserRequests() {
        try {
            String email = currentUserService.getCurrentUser().getEmail();
            List<AccessRequest> requests = service.getRequestsByUser(email);
            return new ApiResponse<>(
                    true,
                    "User requests fetched",
                    requests
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to fetch requests: " + e.getMessage(),
                    List.of()
            );
        }
    }

    /*
     * GET USER'S REQUEST FOR A SPECIFIC PROJECT
     */
    @GetMapping("/user/me/project/{projectId}")
    public ApiResponse<AccessRequest> getUserProjectRequest(
            @PathVariable String projectId
    ) {
        try {
            String email = currentUserService.getCurrentUser().getEmail();
            AccessRequest request = service.getRequestByUserAndProject(email, projectId);
            if (request == null) {
                return new ApiResponse<>(
                        true,
                        "No request found for this project",
                        null
                );
            }
            return new ApiResponse<>(
                    true,
                    "Request fetched",
                    request
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to fetch request: " + e.getMessage(),
                    null
            );
        }
    }

    /*
     * CHECK IF USER HAS ACCESS TO A PROJECT
     */
    @GetMapping("/user/me/project/{projectId}/access")
    public ApiResponse<Boolean> hasProjectAccess(
            @PathVariable String projectId
    ) {
        try {
            String email = currentUserService.getCurrentUser().getEmail();
            boolean hasAccess = service.hasApprovedProjectAccess(email, projectId);
            return new ApiResponse<>(
                    true,
                    "Access check completed",
                    hasAccess
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to check access: " + e.getMessage(),
                    false
            );
        }
    }

    /*
     * GET USER'S REQUEST FOR A SPECIFIC MEDIA
     */
    @GetMapping("/user/me/media/{mediaId}")
    public ApiResponse<AccessRequest> getUserMediaRequest(
            @PathVariable String mediaId
    ) {
        try {
            String email = currentUserService.getCurrentUser().getEmail();
            AccessRequest request = service.getRequestByUserAndMedia(email, mediaId);
            if (request == null) {
                return new ApiResponse<>(
                        true,
                        "No request found for this media",
                        null
                );
            }
            return new ApiResponse<>(
                    true,
                    "Request fetched",
                    request
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to fetch request: " + e.getMessage(),
                    null
            );
        }
    }

    /*
     * CHECK IF USER HAS ACCESS TO A MEDIA
     */
    @GetMapping("/user/me/media/{mediaId}/access")
    public ApiResponse<Boolean> hasMediaAccess(
            @PathVariable String mediaId
    ) {
        try {
            String email = currentUserService.getCurrentUser().getEmail();
            boolean hasAccess = service.hasAccessToMedia(email, mediaId);
            return new ApiResponse<>(
                    true,
                    "Access check completed",
                    hasAccess
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to check access: " + e.getMessage(),
                    false
            );
        }
    }

    /*
     * APPROVE REQUEST (ADMIN ONLY)
     */
    @PutMapping("/{id}/approve")
    public ApiResponse<AccessRequest> approve(
            @PathVariable String id,
            @RequestBody AccessDecisionRequest body
    ) {
        return new ApiResponse<>(
                true,
                "Access request approved",
                service.approve(id, body.getAdminMessage())
        );
    }

    /*
     * REJECT REQUEST (ADMIN ONLY)
     */
    @PutMapping("/{id}/reject")
    public ApiResponse<AccessRequest> reject(
            @PathVariable String id,
            @RequestBody AccessDecisionRequest body
    ) {
        return new ApiResponse<>(
                true,
                "Access request rejected",
                service.reject(id, body.getAdminMessage())
        );
    }
}