package com.portfolio.project.dto;

import com.portfolio.common.PaginationResponse;
import com.portfolio.project.model.Blog;
import com.portfolio.project.model.Project;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GlobalSearchResponse {

    private PaginationResponse<Project> projects;

    private PaginationResponse<Blog> blogs;
}