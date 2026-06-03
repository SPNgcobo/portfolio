package com.portfolio.project.repository;

import com.portfolio.project.model.ProjectEngagement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProjectEngagementRepository
        extends MongoRepository<ProjectEngagement, String> {

    boolean existsByProjectIdAndFingerprintAndType(
            String projectId,
            String fingerprint,
            String type
    );

    Optional<ProjectEngagement> findByProjectIdAndFingerprintAndType(
            String projectId,
            String fingerprint,
            String type
    );
}