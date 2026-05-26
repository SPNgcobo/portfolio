package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.SecureMediaResponse;
import com.portfolio.project.model.Media;
import com.portfolio.project.service.MediaService;
import com.portfolio.project.service.VaultGuardService;
import com.portfolio.security.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

    private final MediaService service;

    private final VaultGuardService
            vaultGuardService;

    private final RateLimitService
            rateLimitService;

    public MediaController(
            MediaService service,
            VaultGuardService vaultGuardService,
            RateLimitService rateLimitService
    ) {

        this.service = service;

        this.vaultGuardService =
                vaultGuardService;

        this.rateLimitService =
                rateLimitService;
    }

    /*
     * CREATE
     */
    @PostMapping
    public ApiResponse<Media> create(
            @RequestBody Media media
    ) {

        return new ApiResponse<>(
                true,
                "Media created",
                service.create(media)
        );
    }

    /*
     * GET PROJECT MEDIA
     */
    @GetMapping("/project/{projectId}")
    public ApiResponse<List<SecureMediaResponse>>
    getProjectMedia(
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
    public ApiResponse<List<SecureMediaResponse>>
    getPublicProjectMedia(
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
     * SECURE MEDIA ACCESS
     */
    @GetMapping("/{id}")
    public ApiResponse<SecureMediaResponse> getMedia(
            @PathVariable String id,
            @RequestParam(required = false)
            String email,
            HttpServletRequest request
    ) {

        String ip =
                request.getRemoteAddr();

        /*
         * RATE LIMIT
         */
        boolean allowed =
                rateLimitService.isAllowed(
                        "MEDIA_" + ip
                );

        if (!allowed) {

            throw new IllegalStateException(
                    "Too many requests"
            );
        }

        Media media =
                service.getById(id);

        /*
         * PUBLIC
         */
        if (service.isPublic(media)) {

            return new ApiResponse<>(
                    true,
                    "Media fetched",
                    service.toResponse(media)
            );
        }

        /*
         * VAULT
         */
        if (service.isVault(media)) {

            if (email == null
                    || email.isBlank()) {

                throw new IllegalStateException(
                        "Vault access requires email"
                );
            }

            boolean hasAccess =
                    vaultGuardService
                            .canAccessMedia(
                                    email,
                                    media.getId()
                            );

            if (!hasAccess) {

                throw new IllegalStateException(
                        "Access denied"
                );
            }

            return new ApiResponse<>(
                    true,
                    "Vault media fetched",
                    service.toResponse(media)
            );
        }

        throw new IllegalStateException(
                "Private media"
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
                "Media deleted",
                null
        );
    }
}