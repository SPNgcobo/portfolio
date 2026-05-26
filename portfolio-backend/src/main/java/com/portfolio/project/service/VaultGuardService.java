package com.portfolio.project.service;

import com.portfolio.project.model.AccessStatus;
import com.portfolio.project.model.Media;
import com.portfolio.project.repository.AccessRequestRepository;
import com.portfolio.project.repository.MediaRepository;
import org.springframework.stereotype.Service;

@Service
public class VaultGuardService {

    private final AccessRequestRepository repository;

    private final MediaRepository mediaRepository;

    public VaultGuardService(
            AccessRequestRepository repository,
            MediaRepository mediaRepository
    ) {

        this.repository = repository;

        this.mediaRepository =
                mediaRepository;
    }

    /*
     * PROJECT ACCESS
     */
    public boolean canAccessProject(
            String email,
            String projectId
    ) {

        return repository
                .existsByEmailAndProjectIdAndStatus(
                        email,
                        projectId,
                        AccessStatus.APPROVED
                );
    }

    /*
     * MEDIA ACCESS
     */
    public boolean canAccessMedia(
            String email,
            String mediaId
    ) {

        /*
         * FIND MEDIA
         */
        Media media =
                mediaRepository.findById(mediaId)
                        .orElse(null);

        if (media == null) {
            return false;
        }

        /*
         * CHECK PROJECT ACCESS
         */
        return repository
                .existsByEmailAndProjectIdAndStatus(
                        email,
                        media.getProjectId(),
                        AccessStatus.APPROVED
                );
    }
}