package com.portfolio.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalProjects;

    private long totalBlogs;

    private long totalProjectViews;

    private long totalProjectLikes;

    private long publishedBlogs;

    private long featuredProjects;

    private long totalGithubClicks;

    private long totalDemoClicks;

    private long totalDetailClicks;

    private long totalComments;

    private long totalVisitors;
}