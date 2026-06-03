package com.portfolio.project.repository;

import com.portfolio.project.model.ProjectEngagement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectEngagementRepository
        extends MongoRepository<ProjectEngagement, String> {

    boolean existsByProjectIdAndFingerprintAndType(
            String projectId,
            String fingerprint,
            String type
    );

    List<ProjectEngagement> findAllByProjectIdAndFingerprintAndType(
            String projectId,
            String fingerprint,
            String type
    );
}