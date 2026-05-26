package com.portfolio.project.repository;

import com.portfolio.project.model.ProjectEngagement;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProjectEngagementRepository
        extends MongoRepository<ProjectEngagement, String> {

    boolean existsByProjectIdAndIpAddressAndType(
            String projectId,
            String ipAddress,
            String type
    );
}