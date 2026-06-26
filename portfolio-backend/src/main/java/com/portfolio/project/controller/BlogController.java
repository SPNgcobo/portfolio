package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Blog;
import com.portfolio.project.service.BlogService;
import com.portfolio.project.service.NotificationEventService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService service;

    private final NotificationEventService notificationEventService;

    public BlogController(
            BlogService service,
            NotificationEventService notificationEventService
    ) {
        this.service = service;
        this.notificationEventService = notificationEventService;
    }

    // ============ PUBLIC ENDPOINTS ============

    /*
     * GET BLOGS (PUBLIC) - Only published blogs
     */
    @GetMapping
    public ApiResponse<Page<Blog>> getBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ApiResponse<>(
                true,
                "Blogs fetched",
                service.getBlogs(page, size)
        );
    }

    /*
     * GET BY SLUG (PUBLIC)
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
     * SEARCH (PUBLIC)
     */
    @GetMapping("/search")
    public ApiResponse<Page<Blog>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ApiResponse<>(
                true,
                "Blogs fetched",
                service.search(q, page, size)
        );
    }

    /*
     * RELATED BLOGS (PUBLIC)
     */
    @GetMapping("/{slug}/related")
    public ApiResponse<List<Blog>> relatedBlogs(
            @PathVariable String slug
    ) {
        return new ApiResponse<>(
                true,
                "Related blogs fetched",
                service.getRelatedBlogs(slug)
        );
    }

    // ============ ADMIN ENDPOINTS ============

    /*
     * GET ALL BLOGS FOR ADMIN (Includes drafts)
     */
    @GetMapping("/admin/blogs")
    public ApiResponse<List<Blog>> getAllBlogsForAdmin() {
        return new ApiResponse<>(
                true,
                "All blogs fetched",
                service.getAllBlogsForAdmin()
        );
    }

    /*
     * GET BLOG BY ID FOR ADMIN
     */
    @GetMapping("/admin/blogs/{id}")
    public ApiResponse<Blog> getBlogByIdForAdmin(
            @PathVariable String id
    ) {
        return new ApiResponse<>(
                true,
                "Blog fetched",
                service.getById(id)
        );
    }

    /*
     * CREATE BLOG (ADMIN)
     */
    @PostMapping("/admin/blogs")
    public ApiResponse<Blog> createBlog(
            @RequestBody Blog blog
    ) {
        Blog created = service.create(blog);

        notificationEventService.broadcast(
                "BLOG_CREATED",
                "New blog post: \"" + created.getTitle() + "\""
        );

        return new ApiResponse<>(
                true,
                "Blog created",
                created
        );
    }

    /*
     * UPDATE BLOG (ADMIN)
     */
    @PutMapping("/admin/blogs/{id}")
    public ApiResponse<Blog> updateBlog(
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
     * DELETE BLOG (ADMIN)
     */
    @DeleteMapping("/admin/blogs/{id}")
    public ApiResponse<Void> deleteBlog(
            @PathVariable String id
    ) {
        service.delete(id);
        return new ApiResponse<>(
                true,
                "Blog deleted",
                null
        );
    }

    /*
     * PUBLISH BLOG (ADMIN)
     */
    @PutMapping("/admin/blogs/{id}/publish")
    public ApiResponse<Blog> publishBlog(
            @PathVariable String id
    ) {
        Blog blog = service.publishBlog(id);

        notificationEventService.broadcast(
                "BLOG_PUBLISHED",
                "Blog post \"" + blog.getTitle() + "\" has been published"
        );

        return new ApiResponse<>(
                true,
                "Blog published",
                blog
        );
    }

    /*
     * UNPUBLISH BLOG (ADMIN)
     */
    @PutMapping("/admin/blogs/{id}/unpublish")
    public ApiResponse<Blog> unpublishBlog(
            @PathVariable String id
    ) {
        return new ApiResponse<>(
                true,
                "Blog unpublished",
                service.unpublishBlog(id)
        );
    }

    /*
     * FEATURE BLOG (ADMIN)
     */
    @PutMapping("/admin/blogs/{id}/feature")
    public ApiResponse<Blog> featureBlog(
            @PathVariable String id
    ) {
        return new ApiResponse<>(
                true,
                "Blog featured",
                service.featureBlog(id)
        );
    }

    /*
     * UNFEATURE BLOG (ADMIN)
     */
    @PutMapping("/admin/blogs/{id}/unfeature")
    public ApiResponse<Blog> unfeatureBlog(
            @PathVariable String id
    ) {
        return new ApiResponse<>(
                true,
                "Blog unfeatured",
                service.unfeatureBlog(id)
        );
    }
}