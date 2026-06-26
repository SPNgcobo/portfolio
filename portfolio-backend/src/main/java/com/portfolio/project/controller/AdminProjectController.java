package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.AnalyticsResponse;
import com.portfolio.project.model.Project;
import com.portfolio.project.service.NotificationEventService;
import com.portfolio.project.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectController {

    private final ProjectService service;

    private final NotificationEventService notificationEventService;

    public AdminProjectController(
            ProjectService service,
            NotificationEventService notificationEventService
    ) {
        this.service = service;
        this.notificationEventService = notificationEventService;
    }

    /*
     * ALL PROJECTS FOR ADMIN
     */
    @GetMapping
    public ApiResponse<List<Project>> getAllProjects() {

        return new ApiResponse<>(
                true,
                "Projects fetched",
                service.getAdminProjects()
        );
    }

    /*
     * ADMIN GET PROJECT BY ID
     */
    @GetMapping("/{id}")
    public ApiResponse<Project> getById(
            @PathVariable String id
    ) {

        return new ApiResponse<>(
                true,
                "Admin project fetched",
                service.getAdminProjectById(id)
        );
    }

    /*
     * UNPUBLISHED PROJECTS
     */
    @GetMapping("/unpublished")
    public ApiResponse<Page<Project>>
    getUnpublishedProjects(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Unpublished projects fetched",
                service.getUnpublishedProjects(
                        page,
                        size
                )
        );
    }

    /*
     * PROJECT ANALYTICS
     */
    @GetMapping("/analytics")
    public ApiResponse<AnalyticsResponse>
    analytics() {

        return new ApiResponse<>(
                true,
                "Project analytics fetched",
                service.analytics()
        );
    }

    /*
     * PUBLISH PROJECT
     */
    @PutMapping("/{id}/publish")
    public ApiResponse<Project>
    publishProject(
            @PathVariable String id
    ) {

        Project project = service.publishProject(id);

        notificationEventService.broadcast(
                "PROJECT_PUBLISHED",
                "Project \"" + project.getTitle() + "\" has been published"
        );

        return new ApiResponse<>(
                true,
                "Project published",
                project
        );
    }

    /*
     * UNPUBLISH PROJECT
     */
    @PutMapping("/{id}/unpublish")
    public ApiResponse<Project>
    unpublishProject(
            @PathVariable String id
    ) {

        Project project = service.unpublishProject(id);

        notificationEventService.broadcast(
                "PROJECT_UNPUBLISHED",
                "Project \"" + project.getTitle() + "\" has been unpublished"
        );

        return new ApiResponse<>(
                true,
                "Project unpublished",
                project
        );
    }

    /*
     * FEATURE PROJECT
     */
    @PutMapping("/{id}/feature")
    public ApiResponse<Project>
    featureProject(
            @PathVariable String id
    ) {

        return new ApiResponse<>(
                true,
                "Project featured",
                service.featureProject(id)
        );
    }

    /*
     * UNFEATURE PROJECT
     */
    @PutMapping("/{id}/unfeature")
    public ApiResponse<Project>
    unfeatureProject(
            @PathVariable String id
    ) {

        return new ApiResponse<>(
                true,
                "Project unfeatured",
                service.unfeatureProject(id)
        );
    }
}