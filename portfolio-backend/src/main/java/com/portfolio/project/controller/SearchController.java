package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.common.PaginationResponse;
import com.portfolio.project.dto.GlobalSearchResponse;
import com.portfolio.project.model.Blog;
import com.portfolio.project.model.Project;
import com.portfolio.project.service.BlogService;
import com.portfolio.project.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ProjectService projectService;

    private final BlogService blogService;

    public SearchController(
            ProjectService projectService,
            BlogService blogService
    ) {

        this.projectService = projectService;
        this.blogService = blogService;
    }

    /*
     * GLOBAL SEARCH
     */
    @GetMapping
    public ApiResponse<GlobalSearchResponse>
    search(

            @RequestParam String keyword,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "5")
            int size
    ) {

        Page<Project> projects =
                projectService.search(
                        keyword,
                        page,
                        size
                );

        Page<Blog> blogs =
                blogService.search(
                        keyword,
                        page,
                        size
                );

        return new ApiResponse<>(
                true,
                "Search completed",
                new GlobalSearchResponse(
                        new PaginationResponse<>(
                                projects
                        ),
                        new PaginationResponse<>(
                                blogs
                        )
                )
        );
    }
}