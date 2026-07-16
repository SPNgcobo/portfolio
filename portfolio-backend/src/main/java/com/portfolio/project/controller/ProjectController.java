package com.portfolio.project.controller;

import com.portfolio.analytics.service.AnalyticsService;
import com.portfolio.common.ApiResponse;
import com.portfolio.dashboard.websocket.DashboardActivityPublisher;
import com.portfolio.project.model.Project;
import com.portfolio.project.service.ProjectEngagementService;
import com.portfolio.project.service.ProjectService;
import com.portfolio.analytics.service.VisitorFingerprintService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService service;
    private final ProjectEngagementService engagementService;
    private final DashboardActivityPublisher activityPublisher;
    private final AnalyticsService analyticsService;
    private final VisitorFingerprintService fingerprintService;

    public ProjectController(
            ProjectService service,
            ProjectEngagementService engagementService,
            DashboardActivityPublisher activityPublisher,
            AnalyticsService analyticsService,
            VisitorFingerprintService fingerprintService
    ) {
        this.service = service;
        this.engagementService = engagementService;
        this.activityPublisher = activityPublisher;
        this.analyticsService = analyticsService;
        this.fingerprintService = fingerprintService;
    }

    /*
     * GET ALL
     */
    @GetMapping
    public ApiResponse<Page<Project>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return new ApiResponse<>(
                true,
                "Projects fetched successfully",
                service.getProjects(page, size, sortBy, direction)
        );
    }

    /*
     * SEARCH
     */
    @GetMapping("/search")
    public ApiResponse<Page<Project>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.search(q, page, size)
        );
    }

    /*
     * FEATURED
     */
    @GetMapping("/featured")
    public ApiResponse<Page<Project>> getFeaturedProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ApiResponse<>(
                true,
                "Featured projects fetched",
                service.getFeaturedProjects(page, size)
        );
    }

    /*
     * TECH STACK
     */
    @GetMapping("/tech-stack/{tech}")
    public ApiResponse<Page<Project>> getByTechStack(
            @PathVariable String tech,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.getByTechStack(tech, page, size)
        );
    }

    /*
     * TOOL FILTER
     */
    @GetMapping("/tool/{tool}")
    public ApiResponse<Page<Project>> getByTool(
            @PathVariable String tool,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.getByTool(tool, page, size)
        );
    }

    /*
     * BY ID
     */
    @GetMapping("/{id}")
    public ApiResponse<Project> getById(@PathVariable String id) {
        return new ApiResponse<>(
                true,
                "Project fetched successfully",
                service.getById(id)
        );
    }

    /*
     * RELATED
     */
    @GetMapping("/{id}/related")
    public ApiResponse<List<Project>> relatedProjects(@PathVariable String id) {
        return new ApiResponse<>(
                true,
                "Related projects fetched",
                service.getRelatedProjects(id)
        );
    }

    /*
     * CREATE
     */
    @PostMapping
    public ApiResponse<Project> create(@RequestBody Project project) {
        return new ApiResponse<>(
                true,
                "Project created successfully",
                service.create(project)
        );
    }

    /*
     * UPDATE
     */
    @PutMapping("/{id}")
    public ApiResponse<Project> update(
            @PathVariable String id,
            @RequestBody Project project
    ) {
        return new ApiResponse<>(
                true,
                "Project updated successfully",
                service.update(id, project)
        );
    }

    /*
     * DELETE
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        service.delete(id);
        return new ApiResponse<>(
                true,
                "Project deleted successfully",
                null
        );
    }

    /*
     * VIEW
     */
    @PostMapping("/{id}/view")
    public ApiResponse<Project> incrementView(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        analyticsService.trackVisit(request, "/projects/" + id);

        String fingerprint = fingerprintService.generateFingerprint(request);

        engagementService.track(id, fingerprint, "VIEW");

        activityPublisher.publish(
                "VIEW",
                "Project viewed: " + id
        );

        return new ApiResponse<>(
                true,
                "View tracked",
                service.incrementView(id)
        );
    }

    /*
     * GITHUB CLICK
     */
    @PostMapping("/{id}/github-click")
    public ApiResponse<Project> githubClick(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        String fingerprint = fingerprintService.generateFingerprint(request);

        engagementService.track(id, fingerprint, "GITHUB_CLICK");

        activityPublisher.publish(
                "GITHUB_CLICK",
                "Github clicked: " + id
        );

        return new ApiResponse<>(
                true,
                "Github click tracked",
                service.incrementGithubClick(id)
        );
    }

    /*
     * DEMO CLICK
     */
    @PostMapping("/{id}/demo-click")
    public ApiResponse<Project> demoClick(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        String fingerprint = fingerprintService.generateFingerprint(request);

        engagementService.track(id, fingerprint, "DEMO_CLICK");

        activityPublisher.publish(
                "DEMO_CLICK",
                "Demo clicked: " + id
        );

        return new ApiResponse<>(
                true,
                "Demo click tracked",
                service.incrementDemoClick(id)
        );
    }

    /*
     * DETAIL CLICK - Track unique users using fingerprint
     */
    @PostMapping("/{id}/detail-click")
    public ApiResponse<Project> detailClick(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        String fingerprint = fingerprintService.generateFingerprint(request);

        engagementService.track(id, fingerprint, "DETAIL_CLICK");

        activityPublisher.publish(
                "DETAIL_CLICK",
                "Project detail opened: " + id
        );

        return new ApiResponse<>(
                true,
                "Detail click tracked",
                service.incrementDetailClick(id)
        );
    }

    /*
     * LIKE
     */
    @PostMapping("/{id}/like")
    public ApiResponse<Project> like(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        String fingerprint =
                fingerprintService.generateFingerprint(request);

        boolean liked =
                engagementService.toggleLike(id, fingerprint);

        activityPublisher.publish(
                liked ? "LIKE" : "UNLIKE",
                "Project " + (liked ? "liked" : "unliked") + ": " + id
        );

        Project updated =
                liked
                        ? service.incrementLike(id)
                        : service.decrementLike(id);

        return new ApiResponse<>(
                true,
                liked ? "Project liked" : "Project unliked",
                updated
        );
    }
}