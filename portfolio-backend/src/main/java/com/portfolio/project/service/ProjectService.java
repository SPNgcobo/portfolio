package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.dashboard.websocket.DashboardActivityPublisher;
import com.portfolio.project.service.NotificationEventService;
import com.portfolio.project.dto.AnalyticsResponse;
import com.portfolio.project.model.Project;
import com.portfolio.project.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repository;

    private final DashboardActivityPublisher publisher;

    private final NotificationEventService notificationEventService;


    public ProjectService(
            ProjectRepository repository,
            DashboardActivityPublisher publisher,
            NotificationEventService notificationEventService
    ) {
        this.repository = repository;
        this.publisher = publisher;
        this.notificationEventService = notificationEventService;
    }

    /*
     * PUBLIC PROJECTS
     */
    public List<Project> getAllProjects() {

        return repository.findByPublishedTrue();
    }

    /*
     * ADMIN PROJECTS
     */
    public List<Project> getAdminProjects() {

        return repository.findAll();
    }

    /*
     * PUBLIC PROJECT BY ID
     */
    public Project getById(String id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );
    }

    /*
     * ADMIN PROJECT BY ID
     */
    public Project getAdminProjectById(String id) {

        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );
    }

    /*
     * CREATE
     */
    public Project create(Project project) {

        project.setCreatedAt(new Date());

        project.setUpdatedAt(new Date());

        if (project.getViewCount() == 0)
            project.setViewCount(0);

        if (project.getGithubClicks() == 0)
            project.setGithubClicks(0);

        if (project.getDemoClicks() == 0)
            project.setDemoClicks(0);

        if (project.getDetailClicks() == 0)
            project.setDetailClicks(0);

        if (project.getLikes() == 0)
            project.setLikes(0);

        if (project.getCommentsCount() == 0)
            project.setCommentsCount(0);

        return repository.save(project);
    }

    /*
     * UPDATE
     */
    public Project update(
            String id,
            Project updated
    ) {

        Project project =
                getAdminProjectById(id);

        project.setTitle(updated.getTitle());

        project.setDescription(
                updated.getDescription()
        );

        project.setProblem(
                updated.getProblem()
        );

        project.setArchitecture(
                updated.getArchitecture()
        );

        project.setFeatures(
                updated.getFeatures()
        );

        project.setChallenges(
                updated.getChallenges()
        );

        project.setImages(
                updated.getImages()
        );

        project.setTechStack(
                updated.getTechStack()
        );

        project.setGithub(
                updated.getGithub()
        );

        project.setGithubVisible(
                updated.isGithubVisible()
        );

        project.setLiveDemoUrl(
                updated.getLiveDemoUrl()
        );

        project.setFeatured(
                updated.isFeatured()
        );

        project.setPublished(
                updated.isPublished()
        );

        project.setUpdatedAt(
                new Date()
        );

        return repository.save(project);
    }

    /*
     * DELETE
     */
    public void delete(String id) {

        Project project =
                getAdminProjectById(id);

        repository.delete(project);
    }

    /*
     * VIEW COUNT
     */
    public Project incrementView(String id) {

        Project project =
                getAdminProjectById(id);

        project.setViewCount(
                project.getViewCount() + 1
        );

        publisher.publish(
                "PROJECT_VIEW",
                project.getTitle() + " viewed"
        );

        return repository.save(project);
    }

    /*
     * GITHUB CLICK
     */
    public Project incrementGithubClick(String id) {
        Project project = getAdminProjectById(id);
        project.setGithubClicks(project.getGithubClicks() + 1);
        publisher.publish("GITHUB_CLICK", project.getTitle() + " GitHub clicked");

        notificationEventService.broadcast(
                "GITHUB_CLICK",
                "GitHub link clicked on project \"" + project.getTitle() + "\""
        );

        return repository.save(project);
    }

    /*
     * DEMO CLICK
     */
    public Project incrementDemoClick(String id) {
        Project project = getAdminProjectById(id);
        project.setDemoClicks(project.getDemoClicks() + 1);
        publisher.publish("DEMO_CLICK", project.getTitle() + " demo opened");

        notificationEventService.broadcast(
                "DEMO_CLICK",
                "Live demo opened for project \"" + project.getTitle() + "\""
        );

        return repository.save(project);
    }

    /*
     * DETAIL CLICK
     */
    public Project incrementDetailClick(String id) {
        Project project = getAdminProjectById(id);
        project.setDetailClicks(project.getDetailClicks() + 1);

        notificationEventService.broadcast(
                "DETAIL_CLICK",
                "Project detail page viewed: \"" + project.getTitle() + "\""
        );

        return repository.save(project);
    }

    /*
     * LIKE
     */
    public Project incrementLike(String id) {
        Project project = getAdminProjectById(id);
        project.setLikes(project.getLikes() + 1);
        publisher.publish("PROJECT_LIKE", project.getTitle() + " liked");

        notificationEventService.broadcast(
                "PROJECT_LIKE",
                "Project \"" + project.getTitle() + "\" received a like! Total likes: " + project.getLikes()
        );

        return repository.save(project);
    }

    /*
     * COMMENTS COUNT
     */
    public void incrementComments(
            String id
    ) {

        Project project =
                getAdminProjectById(id);

        project.setCommentsCount(
                project.getCommentsCount() + 1
        );

        repository.save(project);
    }

    /*
     * PAGINATED PROJECTS
     */
    public Page<Project> getProjects(
            int page,
            int size,
            String sortBy,
            String direction
    ) {

        Sort sort =
                direction.equalsIgnoreCase("asc")
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending();

        Pageable pageable =
                PageRequest.of(page, size, sort);

        return repository.findByPublishedTrue(
                pageable
        );
    }

    /*
     * UNPUBLISHED PROJECTS
     */
    public Page<Project> getUnpublishedProjects(
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository.findByPublishedFalse(
                pageable
        );
    }

    /*
     * PUBLISH PROJECT
     */
    public Project publishProject(
            String id
    ) {

        Project project =
                getAdminProjectById(id);

        project.setPublished(true);

        project.setUpdatedAt(
                new Date()
        );

        publisher.publish(
                "PROJECT_PUBLISHED",
                project.getTitle() + " published"
        );

        return repository.save(project);
    }

    /*
     * UNPUBLISH PROJECT
     */
    public Project unpublishProject(
            String id
    ) {

        Project project =
                getAdminProjectById(id);

        project.setPublished(false);

        project.setUpdatedAt(
                new Date()
        );

        publisher.publish(
                "PROJECT_UNPUBLISHED",
                project.getTitle() + " unpublished"
        );

        return repository.save(project);
    }

    /*
     * FEATURE PROJECT
     */
    public Project featureProject(
            String id
    ) {

        Project project =
                getAdminProjectById(id);

        project.setFeatured(true);

        project.setUpdatedAt(
                new Date()
        );

        publisher.publish(
                "PROJECT_FEATURED",
                project.getTitle() + " featured"
        );

        return repository.save(project);
    }

    /*
     * UNFEATURE PROJECT
     */
    public Project unfeatureProject(
            String id
    ) {

        Project project =
                getAdminProjectById(id);

        project.setFeatured(false);

        project.setUpdatedAt(
                new Date()
        );

        publisher.publish(
                "PROJECT_UNFEATURED",
                project.getTitle() + " unfeatured"
        );

        return repository.save(project);
    }

    /*
     * SEARCH
     */
    public Page<Project> search(
            String keyword,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository.searchProjects(
                keyword,
                pageable
        );
    }

    /*
     * FEATURED
     */
    public Page<Project> getFeaturedProjects(
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository
                .findByFeaturedTrueAndPublishedTrue(
                        pageable
                );
    }

    /*
     * FILTER BY STACK
     */
    public Page<Project> getByTechStack(
            String tech,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository
                .findByTechStackContainingIgnoreCase(
                        tech,
                        pageable
                );
    }

    /*
     * FILTER BY TOOL
     */
    public Page<Project> getByTool(
            String tool,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository
                .findByToolsContainingIgnoreCase(
                        tool,
                        pageable
                );
    }

    /*
     * RELATED PROJECTS
     */
    public List<Project> getRelatedProjects(
            String id
    ) {

        Project project =
                getAdminProjectById(id);

        if (project.getTechStack() == null) {

            return List.of();
        }

        return repository.findTop4ByTechStackInAndIdNot(
                project.getTechStack(),
                id
        );
    }

    /*
     * ANALYTICS
     */
    public AnalyticsResponse analytics() {

        List<Project> projects =
                repository.findAll();

        long totalViews = 0;

        long totalLikes = 0;

        long totalComments = 0;

        long totalGithubClicks = 0;

        long totalDemoClicks = 0;

        long totalDetailClicks = 0;

        for (Project project : projects) {

            totalViews +=
                    project.getViewCount();

            totalLikes +=
                    project.getLikes();

            totalComments +=
                    project.getCommentsCount();

            totalGithubClicks +=
                    project.getGithubClicks();

            totalDemoClicks +=
                    project.getDemoClicks();

            totalDetailClicks +=
                    project.getDetailClicks();
        }

        return new AnalyticsResponse(
                projects.size(),
                totalViews,
                totalLikes,
                totalComments,
                totalGithubClicks,
                totalDemoClicks,
                totalDetailClicks
        );
    }

    public Project decrementLike(String id) {

        Project project =
                getAdminProjectById(id);

        project.setLikes(
                Math.max(0, project.getLikes() - 1)
        );

        return repository.save(project);
    }

    public Project updateLikeCount(String id, boolean liked) {

        Project project = getAdminProjectById(id);

        long likes = project.getLikes();

        if (liked) {
            project.setLikes(likes + 1);
        } else {
            project.setLikes(Math.max(0L, likes - 1));
        }

        return repository.save(project);
    }
}