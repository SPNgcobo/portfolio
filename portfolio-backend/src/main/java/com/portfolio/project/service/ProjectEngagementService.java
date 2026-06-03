package com.portfolio.project.service;

import com.portfolio.project.model.ProjectEngagement;
import com.portfolio.project.repository.ProjectEngagementRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProjectEngagementService {

    private final ProjectEngagementRepository repository;

    public ProjectEngagementService(ProjectEngagementRepository repository) {
        this.repository = repository;
    }

    /*
     * TRACK (VIEW / CLICK = ONCE ONLY OR COOLDOWN BASED)
     */
    public void track(
            String projectId,
            String fingerprint,
            String type
    ) {

        List<ProjectEngagement> existing =
                repository.findAllByProjectIdAndFingerprintAndType(
                        projectId,
                        fingerprint,
                        type
                );

        Date now = new Date();

        /*
         * CASE 1: Already exists
         */
        if (!existing.isEmpty()) {

            ProjectEngagement last = existing.get(0);

            long diff = now.getTime() - last.getCreatedAt().getTime();

            long oneDay = 24 * 60 * 60 * 1000;

            if (diff < oneDay) {
                return;
            }

            /*
             * CLEAN OLD RECORDS BEFORE INSERTING NEW ONE
             */
            repository.deleteAll(existing);
        }

        /*
         * CREATE NEW ENGAGEMENT
         */
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

        List<ProjectEngagement> existing =
                repository.findAllByProjectIdAndFingerprintAndType(
                        projectId,
                        fingerprint,
                        "LIKE"
                );

        if (!existing.isEmpty()) {

            repository.deleteAll(existing);
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