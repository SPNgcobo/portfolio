package com.portfolio.project.service;

import com.portfolio.project.model.ProjectEngagement;
import com.portfolio.project.repository.ProjectEngagementRepository;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ProjectEngagementService {

    private final ProjectEngagementRepository repository;

    public ProjectEngagementService(
            ProjectEngagementRepository repository
    ) {

        this.repository = repository;
    }

    /*
     * TRACK
     */
    public void track(
            String projectId,
            String ip,
            String type
    ) {

        boolean exists =
                repository
                        .existsByProjectIdAndIpAddressAndType(
                                projectId,
                                ip,
                                type
                        );

        if (exists) {

            throw new RuntimeException(
                    type + " already counted"
            );
        }

        ProjectEngagement engagement =
                new ProjectEngagement();

        engagement.setProjectId(projectId);

        engagement.setIpAddress(ip);

        engagement.setType(type);

        engagement.setCreatedAt(new Date());

        repository.save(engagement);
    }
}