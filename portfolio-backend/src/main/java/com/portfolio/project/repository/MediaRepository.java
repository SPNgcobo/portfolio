package com.portfolio.project.repository;

import com.portfolio.project.model.Media;
import com.portfolio.project.model.VisibilityType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MediaRepository
        extends MongoRepository<Media, String> {

    /*
     * PROJECT MEDIA
     */
    List<Media> findByProjectId(
            String projectId
    );

    /*
     * PUBLIC PROJECT MEDIA
     */
    List<Media> findByProjectIdAndVisibility(
            String projectId,
            VisibilityType visibility
    );

    /*
     * VISIBILITY
     */
    List<Media> findByVisibility(
            VisibilityType visibility
    );

    /*
     * SINGLE MEDIA
     */
    Optional<Media> findById(
            String id
    );
}