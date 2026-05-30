package com.portfolio.project.controller;

import com.portfolio.analytics.service.AnalyticsService;
import com.portfolio.common.ApiResponse;
import com.portfolio.dashboard.websocket.DashboardActivityPublisher;
import com.portfolio.project.model.Project;
import com.portfolio.project.service.ProjectEngagementService;
import com.portfolio.project.service.ProjectService;
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

    private final AnalyticsService
            analyticsService;

    public ProjectController(
            ProjectService service,
            ProjectEngagementService engagementService,
            DashboardActivityPublisher activityPublisher,
            AnalyticsService analyticsService
    ) {

        this.service = service;

        this.engagementService =
                engagementService;

        this.activityPublisher =
                activityPublisher;

        this.analyticsService =
                analyticsService;
    }

    /*
     * GET ALL
     */
    @GetMapping
    public ApiResponse<Page<Project>> getAll(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction
    ) {

        return new ApiResponse<>(
                true,
                "Projects fetched successfully",
                service.getProjects(
                        page,
                        size,
                        sortBy,
                        direction
                )
        );
    }

    /*
     * SEARCH
     */
    @GetMapping("/search")
    public ApiResponse<Page<Project>> search(

            @RequestParam String q,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.search(
                        q,
                        page,
                        size
                )
        );
    }

    /*
     * FEATURED PROJECTS
     */
    @GetMapping("/featured")
    public ApiResponse<Page<Project>>
    getFeaturedProjects(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Featured projects fetched",
                service.getFeaturedProjects(
                        page,
                        size
                )
        );
    }

    /*
     * FILTER BY TECH STACK
     */
    @GetMapping("/tech-stack/{tech}")
    public ApiResponse<Page<Project>>
    getByTechStack(

            @PathVariable String tech,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.getByTechStack(
                        tech,
                        page,
                        size
                )
        );
    }

    /*
     * FILTER BY TOOL
     */
    @GetMapping("/tool/{tool}")
    public ApiResponse<Page<Project>>
    getByTool(

            @PathVariable String tool,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.getByTool(
                        tool,
                        page,
                        size
                )
        );
    }

    /*
     * GET BY ID
     */
    @GetMapping("/{id}")
    public ApiResponse<Project> getById(
            @PathVariable String id
    ) {

        return new ApiResponse<>(
                true,
                "Project fetched successfully",
                service.getById(id)
        );
    }

    /*
     * RELATED PROJECTS
     */
    @GetMapping("/{id}/related")
    public ApiResponse<List<Project>>
    relatedProjects(
            @PathVariable String id
    ) {

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
    public ApiResponse<Project> create(
            @RequestBody Project project
    ) {

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
    public ApiResponse<Void> delete(
            @PathVariable String id
    ) {

        service.delete(id);

        return new ApiResponse<>(
                true,
                "Project deleted successfully",
                null
        );
    }

    /*
     * VIEW COUNT
     */
    @PostMapping("/{id}/view")
    public ApiResponse<Project> incrementView(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        /*
         * TRACK VISITOR
         */
        analyticsService.trackVisit(
                request,
                "/projects/" + id
        );

        String ip = request.getRemoteAddr();

        engagementService.track(
                id,
                ip,
                "VIEW"
        );

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

        String ip = request.getRemoteAddr();

        engagementService.track(
                id,
                ip,
                "GITHUB_CLICK"
        );

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

        String ip = request.getRemoteAddr();

        engagementService.track(
                id,
                ip,
                "DEMO_CLICK"
        );

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
     * DETAIL CLICK
     */
    @PostMapping("/{id}/detail-click")
    public ApiResponse<Project> detailClick(
            @PathVariable String id
    ) {

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

        String ip = request.getRemoteAddr();

        engagementService.track(
                id,
                ip,
                "LIKE"
        );

        activityPublisher.publish(
                "LIKE",
                "Project liked: " + id
        );

        return new ApiResponse<>(
                true,
                "Project liked",
                service.incrementLike(id)
        );
    }
}