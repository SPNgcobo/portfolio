package com.portfolio.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalyticsDashboardResponse {

    private long totalProjects;

    private long totalViews;

    private long totalLikes;

    private long totalComments;

    private long totalGithubClicks;

    private long totalDemoClicks;

    private long totalDetailClicks;

    private long totalVisitors;
}