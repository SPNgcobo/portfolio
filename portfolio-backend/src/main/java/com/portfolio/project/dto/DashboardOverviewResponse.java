package com.portfolio.project.dto;

import com.portfolio.project.model.Blog;
import com.portfolio.project.model.Project;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardOverviewResponse {

    private DashboardStatsResponse stats;

    private List<Project> recentProjects;

    private List<Blog> recentBlogs;
}