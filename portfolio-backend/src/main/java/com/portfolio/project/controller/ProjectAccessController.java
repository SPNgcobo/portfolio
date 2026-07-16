package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Project;
import com.portfolio.project.service.ProjectService;
import com.portfolio.project.service.VaultGuardService;
import com.portfolio.security.CurrentUserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectAccessController {

    private final ProjectService projectService;
    private final VaultGuardService vaultGuardService;
    private final CurrentUserService currentUserService;

    public ProjectAccessController(
            ProjectService projectService,
            VaultGuardService vaultGuardService,
            CurrentUserService currentUserService
    ) {
        this.projectService = projectService;
        this.vaultGuardService = vaultGuardService;
        this.currentUserService = currentUserService;
    }

    /*
     * Check if the current user has access to a project's private repository
     */
    @GetMapping("/{projectId}/access")
    public ApiResponse<Boolean> checkProjectAccess(
            @PathVariable String projectId
    ) {
        try {
            String email = currentUserService.getCurrentUser().getEmail();
            boolean hasAccess = vaultGuardService.canAccessProject(email, projectId);
            return new ApiResponse<>(true, "Access check completed", hasAccess);
        } catch (Exception e) {
            return new ApiResponse<>(true, "User not authenticated", false);
        }
    }

    /*
     * Get project with GitHub URL (only if user has access)
     */
    @GetMapping("/{projectId}/github")
    public ApiResponse<String> getGithubUrl(
            @PathVariable String projectId
    ) {
        try {
            String email;
            try {
                email = currentUserService.getCurrentUser().getEmail();
            } catch (Exception e) {
                return new ApiResponse<>(
                        false,
                        "Authentication required to access private repositories",
                        null
                );
            }

            boolean hasAccess = vaultGuardService.canAccessProject(email, projectId);
            if (!hasAccess) {
                return new ApiResponse<>(
                        false,
                        "You don't have access to this project's repository. Please request access.",
                        null
                );
            }

            Project project = projectService.getById(projectId);
            if (project.getGithub() == null || project.getGithub().isBlank()) {
                return new ApiResponse<>(
                        false,
                        "No GitHub repository available for this project",
                        null
                );
            }

            return new ApiResponse<>(
                    true,
                    "GitHub URL retrieved",
                    project.getGithub()
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to retrieve GitHub URL: " + e.getMessage(),
                    null
            );
        }
    }

    /*
     * Get access status for a project
     */
    @GetMapping("/{projectId}/access-status")
    public ApiResponse<AccessStatusResponse> getAccessStatus(
            @PathVariable String projectId
    ) {
        try {
            String email = currentUserService.getCurrentUser().getEmail();

            boolean hasAccess = vaultGuardService.canAccessProject(email, projectId);
            if (hasAccess) {
                return new ApiResponse<>(
                        true,
                        "Access status retrieved",
                        new AccessStatusResponse("APPROVED", null)
                );
            }

            return new ApiResponse<>(
                    true,
                    "Access status retrieved",
                    new AccessStatusResponse("UNKNOWN", null)
            );
        } catch (Exception e) {
            return new ApiResponse<>(
                    true,
                    "User not authenticated",
                    new AccessStatusResponse("NONE", null)
            );
        }
    }

    /*
     * Inner class for access status response
     */
    public static class AccessStatusResponse {
        private final String status;
        private final String message;

        public AccessStatusResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }
}