package com.portfolio.analytics.service;

import com.portfolio.analytics.dto.AnalyticsDashboardResponse;
import com.portfolio.analytics.model.Visitor;
import com.portfolio.analytics.repository.VisitorRepository;
import com.portfolio.analytics.service.VisitorFingerprintService;
import com.portfolio.project.model.Project;
import com.portfolio.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AnalyticsService {

    private final VisitorRepository repository;

    private final ProjectRepository projectRepository;

    private final VisitorFingerprintService
            fingerprintService;

    public AnalyticsService(
            VisitorRepository repository,
            ProjectRepository projectRepository,
            VisitorFingerprintService fingerprintService
    ) {

        this.repository = repository;
        this.projectRepository = projectRepository;
        this.fingerprintService =
                fingerprintService;
    }

    /*
     * TRACK VISIT
     */
    public Visitor trackVisit(
            jakarta.servlet.http.HttpServletRequest request,
            String page
    ) {

        String fingerprint =
                fingerprintService
                        .generateFingerprint(
                                request
                        );

        Visitor visitor =
                repository
                        .findByFingerprint(
                                fingerprint
                        )
                        .orElse(null);

        if (visitor == null) {

            visitor = new Visitor();

            visitor.setFingerprint(
                    fingerprint
            );

            visitor.setIpAddress(
                    request.getRemoteAddr()
            );

            String userAgent =
                    request.getHeader(
                            "User-Agent"
                    );

            visitor.setUserAgent(
                    userAgent
            );

            /*
             * BASIC DEVICE DETECTION
             */
            if (userAgent != null) {

                if (userAgent.contains("Windows")) {
                    visitor.setOperatingSystem(
                            "Windows"
                    );
                } else if (userAgent.contains("Android")) {
                    visitor.setOperatingSystem(
                            "Android"
                    );
                } else if (userAgent.contains("iPhone")) {
                    visitor.setOperatingSystem(
                            "iPhone"
                    );
                } else {
                    visitor.setOperatingSystem(
                            "Unknown"
                    );
                }

                if (userAgent.contains("Chrome")) {
                    visitor.setBrowser("Chrome");
                } else if (userAgent.contains("Firefox")) {
                    visitor.setBrowser("Firefox");
                } else {
                    visitor.setBrowser("Unknown");
                }

                if (userAgent.contains("Mobile")) {
                    visitor.setDeviceType("Mobile");
                } else {
                    visitor.setDeviceType("Desktop");
                }
            }

            visitor.setFirstVisitAt(
                    new Date()
            );

            visitor.setTotalVisits(1);

        } else {

            visitor.setTotalVisits(
                    visitor.getTotalVisits() + 1
            );
        }

        visitor.setPage(page);

        visitor.setLastVisitAt(
                new Date()
        );

        return repository.save(visitor);
    }

    /*
     * GET ALL
     */
    public List<Visitor> getAll() {
        return repository.findAll();
    }

    /*
     * TOTAL VISITS
     */
    public long totalVisits() {
        return repository.count();
    }

    /*
     * DASHBOARD ANALYTICS
     */
    public AnalyticsDashboardResponse dashboard() {

        List<Project> projects =
                projectRepository.findAll();

        long totalViews = 0;
        long totalLikes = 0;
        long totalComments = 0;
        long totalGithubClicks = 0;
        long totalDemoClicks = 0;
        long totalDetailClicks = 0;

        for (Project project : projects) {

            totalViews += project.getViewCount();

            totalLikes += project.getLikes();

            totalComments += project.getCommentsCount();

            totalGithubClicks +=
                    project.getGithubClicks();

            totalDemoClicks +=
                    project.getDemoClicks();

            totalDetailClicks +=
                    project.getDetailClicks();
        }

        return new AnalyticsDashboardResponse(
                projects.size(),
                totalViews,
                totalLikes,
                totalComments,
                totalGithubClicks,
                totalDemoClicks,
                totalDetailClicks,
                repository.count()
        );
    }
}