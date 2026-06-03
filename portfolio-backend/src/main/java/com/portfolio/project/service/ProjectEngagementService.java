package com.portfolio.project.service;

import com.portfolio.project.model.ProjectEngagement;
import com.portfolio.project.repository.ProjectEngagementRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class ProjectEngagementService {

    private final ProjectEngagementRepository repository;

    public ProjectEngagementService(ProjectEngagementRepository repository) {
        this.repository = repository;
    }

    /*
     * TRACK (VIEW / CLICK = ONCE ONLY)
     */
    public void track(
            String projectId,
            String fingerprint,
            String type
    ) {

        Optional<ProjectEngagement> existing =
                repository.findByProjectIdAndFingerprintAndType(
                        projectId,
                        fingerprint,
                        type
                );

        Date now = new Date();

        if (existing.isPresent()) {

            long diff =
                    now.getTime() - existing.get().getCreatedAt().getTime();

            // 10 second cooldown protection
            if (diff < 10000) {
                return;
            }
        }

        ProjectEngagement engagement = new ProjectEngagement();

        engagement.setProjectId(projectId);
        engagement.setFingerprint(fingerprint);
        engagement.setType(type);
        engagement.setCreatedAt(now);

        repository.save(engagement);
    }

    /*
     * TOGGLE LIKE
     */
    public boolean toggleLike(
            String projectId,
            String fingerprint
    ) {

        Optional<ProjectEngagement> existing =
                repository.findByProjectIdAndFingerprintAndType(
                        projectId,
                        fingerprint,
                        "LIKE"
                );

        if (existing.isPresent()) {

            repository.delete(existing.get());
            return false;
        }

        ProjectEngagement engagement = new ProjectEngagement();

        engagement.setProjectId(projectId);
        engagement.setFingerprint(fingerprint);
        engagement.setType("LIKE");
        engagement.setCreatedAt(new Date());

        repository.save(engagement);

        return true;
    }
}