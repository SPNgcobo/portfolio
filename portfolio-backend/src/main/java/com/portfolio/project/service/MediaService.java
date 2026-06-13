package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.project.dto.SecureMediaResponse;
import com.portfolio.project.model.Media;
import com.portfolio.project.model.VisibilityType;
import com.portfolio.project.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MediaService {

    private final MediaRepository repository;

    private final CloudinaryService
            cloudinaryService;

    public MediaService(
            MediaRepository repository,
            CloudinaryService cloudinaryService
    ) {

        this.repository = repository;

        this.cloudinaryService =
                cloudinaryService;
    }

    /*
     * CREATE
     */
    public Media create(Media media) {

        media.setCreatedAt(new Date());

        return repository.save(media);
    }

    /*
     * GET PROJECT MEDIA
     */
    public List<Media> getProjectMedia(
            String projectId
    ) {

        return repository.findByProjectId(
                projectId
        );
    }

    /*
     * GET PUBLIC PROJECT MEDIA
     */
    public List<Media> getPublicProjectMedia(
            String projectId
    ) {

        return repository
                .findByProjectIdAndVisibility(
                        projectId,
                        VisibilityType.PUBLIC
                );
    }

    /*
     * GET ALL MEDIA (ADMIN)
     */
    public List<Media> getAllMedia() {
        return repository.findAll();
    }

    /*
     * GET SINGLE MEDIA
     */
    public Media getById(
            String id
    ) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Media not found"
                        )
                );
    }

    /*
     * DELETE
     */
    public void delete(String id) {

        Media media = getById(id);

        /*
         * DELETE FROM CLOUDINARY
         */
        if (media.getPublicId() != null
                && !media.getPublicId().isBlank()) {

            cloudinaryService.delete(
                    media.getPublicId()
            );
        }

        repository.delete(media);
    }

    /*
     * PUBLIC MEDIA
     */
    public boolean isPublic(
            Media media
    ) {

        return media.getVisibility()
                == VisibilityType.PUBLIC;
    }

    /*
     * VAULT MEDIA
     */
    public boolean isVault(
            Media media
    ) {

        return media.getVisibility()
                == VisibilityType.VAULT;
    }

    /*
     * SAFE RESPONSE
     */
    public SecureMediaResponse toResponse(
            Media media
    ) {

        return new SecureMediaResponse(
                media.getId(),
                media.getTitle(),
                media.getDescription(),
                media.getUrl(),
                media.getType(),
                media.getVisibility()
        );
    }

    /*
     * UPDATE MEDIA
     */
    public Media update(String id, Media updatedMedia) {
        Media existing = getById(id);
        existing.setTitle(updatedMedia.getTitle());
        existing.setDescription(updatedMedia.getDescription());
        existing.setUrl(updatedMedia.getUrl());
        existing.setPublicId(updatedMedia.getPublicId());
        existing.setType(updatedMedia.getType());
        existing.setVisibility(updatedMedia.getVisibility());
        existing.setSize(updatedMedia.getSize());
        existing.setFormat(updatedMedia.getFormat());
        return repository.save(existing);
    }
}