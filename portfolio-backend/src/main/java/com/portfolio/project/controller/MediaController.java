package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.SecureMediaResponse;
import com.portfolio.project.model.Media;
import com.portfolio.project.model.VisibilityType;
import com.portfolio.project.service.MediaService;
import com.portfolio.project.service.NotificationEventService;
import com.portfolio.project.service.VaultGuardService;
import com.portfolio.security.CurrentUserService;
import com.portfolio.security.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService service;
    private final VaultGuardService vaultGuardService;
    private final RateLimitService rateLimitService;
    private final NotificationEventService notificationEventService;
    private final CurrentUserService currentUserService;

    public MediaController(
            MediaService service,
            VaultGuardService vaultGuardService,
            RateLimitService rateLimitService,
            NotificationEventService notificationEventService,
            CurrentUserService currentUserService
    ) {
        this.service = service;
        this.vaultGuardService = vaultGuardService;
        this.rateLimitService = rateLimitService;
        this.notificationEventService = notificationEventService;
        this.currentUserService = currentUserService;
    }

    /*
     * CREATE
     */
    @PostMapping
    public ApiResponse<Media> create(
            @RequestBody Media media
    ) {
        Media created = service.create(media);

        notificationEventService.broadcast(
                "MEDIA_UPLOADED",
                "New media uploaded: \"" + created.getTitle() + "\" (Type: " + created.getType() + ")"
        );

        notificationEventService.broadcastActivity(
                "VAULT_MEDIA_CREATED",
                "New vault media available: " + created.getTitle()
        );

        return new ApiResponse<>(
                true,
                "Media created",
                created
        );
    }

    /*
     * GET PROJECT MEDIA
     */
    @GetMapping("/project/{projectId}")
    public ApiResponse<List<SecureMediaResponse>> getProjectMedia(
            @PathVariable String projectId
    ) {
        List<SecureMediaResponse> media =
                service.getProjectMedia(projectId)
                        .stream()
                        .map(service::toResponse)
                        .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Media fetched",
                media
        );
    }

    /*
     * GET PUBLIC PROJECT MEDIA
     */
    @GetMapping("/project/{projectId}/public")
    public ApiResponse<List<SecureMediaResponse>> getPublicProjectMedia(
            @PathVariable String projectId
    ) {
        List<SecureMediaResponse> media =
                service.getPublicProjectMedia(projectId)
                        .stream()
                        .map(service::toResponse)
                        .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Public media fetched",
                media
        );
    }

    /*
     * Get all vault media with access status
     */
    @GetMapping("/vault")
    public ApiResponse<List<SecureMediaResponse>> getVaultMedia(
            @RequestParam(required = false) String email
    ) {
        String userEmail = email;
        if (userEmail == null || userEmail.isBlank()) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    userEmail = auth.getName();
                }
            } catch (Exception e) {
            }
        }

        System.out.println("🔐 Vault access requested for email: " + userEmail);

        List<Media> allMedia = service.getAllMedia();
        System.out.println("📊 Total media found: " + allMedia.size());

        List<Media> vaultMedia = vaultGuardService.getVaultMediaWithAccessStatus(userEmail, allMedia);

        List<SecureMediaResponse> response = vaultMedia.stream()
                .map(service::toResponse)
                .collect(Collectors.toList());

        System.out.println("✅ Total vault media returned: " + response.size());

        return new ApiResponse<>(
                true,
                "Vault media fetched",
                response
        );
    }

    /*
     * GET ALL PUBLIC MEDIA
     */
    @GetMapping("/public")
    public ApiResponse<List<SecureMediaResponse>> getPublicMedia() {
        List<Media> allMedia = service.getAllMedia();

        List<SecureMediaResponse> publicMedia = allMedia.stream()
                .filter(media -> media.getVisibility() == VisibilityType.PUBLIC)
                .map(service::toResponse)
                .collect(Collectors.toList());

        System.out.println("📊 Total public media found: " + publicMedia.size());

        return new ApiResponse<>(
                true,
                "Public media fetched",
                publicMedia
        );
    }

    /*
     * GET ALL MEDIA (ADMIN)
     */
    @GetMapping
    public ApiResponse<List<Media>> getAllMedia() {
        return new ApiResponse<>(
                true,
                "All media fetched",
                service.getAllMedia()
        );
    }

    /*
     * SECURE MEDIA ACCESS
     */
    @GetMapping("/{id}")
    public ApiResponse<SecureMediaResponse> getMedia(
            @PathVariable String id,
            @RequestParam(required = false) String email,
            HttpServletRequest request
    ) {
        String ip = request.getRemoteAddr();

        /*
         * RATE LIMIT
         */
        boolean allowed = rateLimitService.isAllowed("MEDIA_" + ip);
        if (!allowed) {
            throw new IllegalStateException("Too many requests");
        }

        Media media = service.getById(id);

        /*
         * PUBLIC - Anyone can access
         */
        if (service.isPublic(media)) {
            return new ApiResponse<>(
                    true,
                    "Media fetched",
                    service.toResponse(media)
            );
        }

        /*
         * VAULT - Check project-based access
         */
        if (service.isVault(media)) {
            String userEmail = email;
            if (userEmail == null || userEmail.isBlank()) {
                try {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                        userEmail = auth.getName();
                    }
                } catch (Exception e) {
                }
            }

            if (userEmail == null || userEmail.isBlank()) {
                throw new IllegalStateException("Authentication required to access vault media");
            }

            boolean hasAccess = vaultGuardService.canAccessMedia(userEmail, media.getId());
            if (!hasAccess) {
                throw new IllegalStateException("Access denied. You need approved access to this project.");
            }

            return new ApiResponse<>(
                    true,
                    "Vault media fetched",
                    service.toResponse(media)
            );
        }

        throw new IllegalStateException("Private media");
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
                "Media deleted",
                null
        );
    }
}