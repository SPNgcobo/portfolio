package com.portfolio.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AnalyticsChartResponse {

    private List<ProjectAnalyticsPoint> topViewedProjects;

    private List<ProjectAnalyticsPoint> topLikedProjects;

    private List<ProjectAnalyticsPoint> topGithubProjects;

    private List<ProjectAnalyticsPoint> topDemoProjects;
}