package com.portfolio.project.service;

import com.portfolio.project.dto.AnalyticsChartResponse;
import com.portfolio.project.dto.DashboardOverviewResponse;
import com.portfolio.project.dto.DashboardStatsResponse;
import com.portfolio.project.dto.ProjectAnalyticsPoint;
import com.portfolio.project.model.Blog;
import com.portfolio.project.model.BlogStatus;
import com.portfolio.project.model.Project;
import com.portfolio.project.repository.BlogRepository;
import com.portfolio.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDashboardService {

    private final ProjectRepository projectRepository;
    private final BlogRepository blogRepository;

    public AdminDashboardService(
            ProjectRepository projectRepository,
            BlogRepository blogRepository
    ) {
        this.projectRepository = projectRepository;
        this.blogRepository = blogRepository;
    }

    /*
     * DASHBOARD STATS
     */
    public DashboardStatsResponse getStats() {
        List<Project> projects = projectRepository.findAll();
        List<Blog> blogs = blogRepository.findAll();

        long totalViews = 0;
        long totalLikes = 0;
        long totalGithubClicks = 0;
        long totalDemoClicks = 0;
        long totalDetailClicks = 0;
        long totalComments = 0;

        for (Project project : projects) {
            totalViews += project.getViewCount();
            totalLikes += project.getLikes();
            totalGithubClicks += project.getGithubClicks();
            totalDemoClicks += project.getDemoClicks();
            totalDetailClicks += project.getDetailClicks();
            totalComments += project.getCommentsCount();
        }

        long publishedBlogs = blogRepository.countByStatus(BlogStatus.PUBLISHED);
        long featuredProjects = projectRepository.countByFeaturedTrue();
        long totalVisitors = totalViews;

        System.out.println("📊 Dashboard Stats - Total Comments: " + totalComments);
        System.out.println("📊 Dashboard Stats - Total Projects: " + projects.size());

        return new DashboardStatsResponse(
                projects.size(),
                blogs.size(),
                totalViews,
                totalLikes,
                publishedBlogs,
                featuredProjects,
                totalGithubClicks,
                totalDemoClicks,
                totalDetailClicks,
                totalComments,
                totalVisitors
        );
    }

    /*
     * DASHBOARD OVERVIEW
     */
    public DashboardOverviewResponse getOverview() {
        DashboardStatsResponse stats = getStats();

        List<Project> recentProjects = projectRepository.findTop5ByOrderByCreatedAtDesc();
        List<Blog> recentBlogs = blogRepository.findTop5ByStatusOrderByCreatedAtDesc(BlogStatus.PUBLISHED);

        return new DashboardOverviewResponse(
                stats,
                recentProjects,
                recentBlogs
        );
    }

    /*
     * ANALYTICS CHARTS
     */
    public AnalyticsChartResponse getAnalyticsCharts() {
        List<Project> projects = projectRepository.findAll();

        List<ProjectAnalyticsPoint> topViewedProjects = projects.stream()
                .sorted((a, b) -> Long.compare(b.getViewCount(), a.getViewCount()))
                .limit(5)
                .map(project -> new ProjectAnalyticsPoint(project.getTitle(), project.getViewCount()))
                .toList();

        List<ProjectAnalyticsPoint> topLikedProjects = projects.stream()
                .sorted((a, b) -> Long.compare(b.getLikes(), a.getLikes()))
                .limit(5)
                .map(project -> new ProjectAnalyticsPoint(project.getTitle(), project.getLikes()))
                .toList();

        List<ProjectAnalyticsPoint> topGithubProjects = projects.stream()
                .sorted((a, b) -> Long.compare(b.getGithubClicks(), a.getGithubClicks()))
                .limit(5)
                .map(project -> new ProjectAnalyticsPoint(project.getTitle(), project.getGithubClicks()))
                .toList();

        List<ProjectAnalyticsPoint> topDemoProjects = projects.stream()
                .sorted((a, b) -> Long.compare(b.getDemoClicks(), a.getDemoClicks()))
                .limit(5)
                .map(project -> new ProjectAnalyticsPoint(project.getTitle(), project.getDemoClicks()))
                .toList();

        return new AnalyticsChartResponse(
                topViewedProjects,
                topLikedProjects,
                topGithubProjects,
                topDemoProjects
        );
    }
}