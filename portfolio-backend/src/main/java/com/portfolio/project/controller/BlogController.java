package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Blog;
import com.portfolio.project.service.BlogService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "*")
public class BlogController {

    private final BlogService service;

    public BlogController(
            BlogService service
    ) {

        this.service = service;
    }

    /*
     * CREATE
     */
    @PostMapping
    public ApiResponse<Blog> create(
            @RequestBody Blog blog
    ) {

        return new ApiResponse<>(
                true,
                "Blog created",
                service.create(blog)
        );
    }

    /*
     * UPDATE
     */
    @PutMapping("/{id}")
    public ApiResponse<Blog> update(
            @PathVariable String id,
            @RequestBody Blog blog
    ) {

        return new ApiResponse<>(
                true,
                "Blog updated",
                service.update(id, blog)
        );
    }

    /*
     * GET BLOGS
     */
    @GetMapping
    public ApiResponse<Page<Blog>>
    getBlogs(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Blogs fetched",
                service.getBlogs(
                        page,
                        size
                )
        );
    }

    /*
     * SEARCH
     */
    @GetMapping("/search")
    public ApiResponse<Page<Blog>> search(

            @RequestParam String q,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        return new ApiResponse<>(
                true,
                "Blogs fetched",
                service.search(
                        q,
                        page,
                        size
                )
        );
    }

    /*
     * GET BY SLUG
     */
    @GetMapping("/{slug}")
    public ApiResponse<Blog> getBySlug(
            @PathVariable String slug
    ) {

        return new ApiResponse<>(
                true,
                "Blog fetched",
                service.getBySlug(slug)
        );
    }

    /*
     * RELATED BLOGS
     */
    @GetMapping("/{slug}/related")
    public ApiResponse<List<Blog>>
    relatedBlogs(
            @PathVariable String slug
    ) {

        return new ApiResponse<>(
                true,
                "Related blogs fetched",
                service.getRelatedBlogs(slug)
        );
    }

    /*
     * DELETE
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable String id
    ) {

        service.delete(id);

        return new ApiResponse<>(
                true,
                "Blog deleted",
                null
        );
    }
}