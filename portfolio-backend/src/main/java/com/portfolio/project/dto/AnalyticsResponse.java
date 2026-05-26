package com.portfolio.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalyticsResponse {

    private long totalProjects;

    private long totalViews;

    private long totalLikes;

    private long totalComments;

    private long totalGithubClicks;

    private long totalDemoClicks;

    private long totalDetailClicks;
}