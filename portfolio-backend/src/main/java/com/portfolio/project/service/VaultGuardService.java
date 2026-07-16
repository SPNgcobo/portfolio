package com.portfolio.project.service;

import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.model.AccessRequestType;
import com.portfolio.project.model.AccessStatus;
import com.portfolio.project.model.Media;
import com.portfolio.project.model.VisibilityType;
import com.portfolio.project.repository.AccessRequestRepository;
import com.portfolio.project.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VaultGuardService {

    private final AccessRequestRepository repository;
    private final MediaRepository mediaRepository;

    public VaultGuardService(
            AccessRequestRepository repository,
            MediaRepository mediaRepository
    ) {
        this.repository = repository;
        this.mediaRepository = mediaRepository;
    }

    /*
     * Normalize email: trim and lowercase
     */
    private String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }

    /*
     * Check if a string is null or empty (including whitespace)
     */
    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    /*
     * PROJECT ACCESS - Check if user has approved access to a project
     */
    public boolean canAccessProject(String email, String projectId) {
        if (email == null || isNullOrEmpty(projectId)) {
            return false;
        }
        String normalizedEmail = normalizeEmail(email);
        return repository.hasApprovedProjectAccess(normalizedEmail, projectId);
    }

    /*
     * MEDIA ACCESS - Checks both direct media access and project access
     */
    public boolean canAccessMedia(String email, String mediaId) {
        if (email == null || mediaId == null) {
            System.out.println("❌ Email or mediaId is null");
            return false;
        }

        String normalizedEmail = normalizeEmail(email);
        System.out.println("🔍 Checking media access for email: " + normalizedEmail + ", mediaId: " + mediaId);

        if (repository.hasApprovedMediaAccess(normalizedEmail, mediaId)) {
            System.out.println("✅ Direct media access granted for: " + mediaId);
            return true;
        }

        Media media = mediaRepository.findById(mediaId).orElse(null);
        if (media != null && !isNullOrEmpty(media.getProjectId())) {
            boolean hasProjectAccess = repository.hasApprovedProjectAccess(normalizedEmail, media.getProjectId());
            if (hasProjectAccess) {
                System.out.println("✅ Project access granted for media: " + mediaId + " via project: " + media.getProjectId());
                return true;
            }
        }

        System.out.println("❌ No access granted for media: " + mediaId);
        return false;
    }

    /*
     * BULK CHECK - Get ALL vault media with access status
     */
    public List<Media> getVaultMediaWithAccessStatus(String email, List<Media> allMedia) {
        if (allMedia == null || allMedia.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedEmail = email != null ? normalizeEmail(email) : null;
        System.out.println("🔍 Getting vault media with access status for: " + normalizedEmail);

        Set<String> approvedProjectIds = Collections.emptySet();
        Set<String> approvedMediaIds = Collections.emptySet();

        if (normalizedEmail != null) {
            List<AccessRequest> approvedRequests = repository.findByEmail(normalizedEmail)
                    .stream()
                    .filter(req -> req.getStatus() == AccessStatus.APPROVED)
                    .collect(Collectors.toList());

            approvedProjectIds = approvedRequests.stream()
                    .filter(req -> !isNullOrEmpty(req.getProjectId()))
                    .map(AccessRequest::getProjectId)
                    .collect(Collectors.toSet());

            approvedMediaIds = approvedRequests.stream()
                    .filter(req -> !isNullOrEmpty(req.getMediaId()))
                    .map(AccessRequest::getMediaId)
                    .collect(Collectors.toSet());

            System.out.println("📋 User has " + approvedProjectIds.size() + " approved projects");
            System.out.println("📋 User has " + approvedMediaIds.size() + " directly approved media (standalone)");
        }

        List<Media> allVaultMedia = allMedia.stream()
                .filter(media -> media.getVisibility() == VisibilityType.VAULT)
                .collect(Collectors.toList());

        System.out.println("📊 Total vault media: " + allVaultMedia.size());

        for (Media media : allVaultMedia) {
            boolean hasAccess = false;

            if (approvedMediaIds.contains(media.getId())) {
                hasAccess = true;
            }
            else if (!isNullOrEmpty(media.getProjectId()) && approvedProjectIds.contains(media.getProjectId())) {
                hasAccess = true;
            }

            System.out.println("  📁 " + media.getTitle() +
                    " (ID: " + media.getId() +
                    ", ProjectId: '" + media.getProjectId() +
                    "', Access: " + hasAccess + ")");
        }

        return allVaultMedia;
    }

    /*
     * DEPRECATED: Use getVaultMediaWithAccessStatus instead
     */
    @Deprecated
    public List<Media> getAccessibleVaultMedia(String email, List<Media> allMedia) {
        return getVaultMediaWithAccessStatus(email, allMedia);
    }
}