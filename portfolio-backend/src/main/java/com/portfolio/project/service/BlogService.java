package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.dashboard.websocket.DashboardActivityPublisher;
import com.portfolio.project.model.Blog;
import com.portfolio.project.model.BlogStatus;
import com.portfolio.project.repository.BlogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class BlogService {

    private final BlogRepository repository;

    private final DashboardActivityPublisher publisher;

    public BlogService(
            BlogRepository repository,
            DashboardActivityPublisher publisher
    ) {

        this.repository = repository;
        this.publisher = publisher;
    }

    /*
     * CREATE
     */
    public Blog create(
            Blog blog
    ) {

        blog.setCreatedAt(new Date());

        blog.setUpdatedAt(new Date());

        /*
         * AUTO SLUG
         */
        if (blog.getSlug() == null
                || blog.getSlug().isBlank()) {

            blog.setSlug(
                    generateSlug(
                            blog.getTitle()
                    )
            );
        }

        /*
         * READ TIME
         */
        blog.setReadTime(
                calculateReadTime(
                        blog.getContent()
                )
        );

        /*
         * PUBLISH DATE
         */
        if (
                blog.getStatus()
                        == BlogStatus.PUBLISHED
        ) {

            blog.setPublishedAt(new Date());
        }

        Blog saved = repository.save(blog);

        publisher.publish(
                "BLOG_CREATED",
                saved.getTitle() + " published"
        );

        return saved;
    }

    /*
     * UPDATE
     */
    public Blog update(
            String id,
            Blog updated
    ) {

        Blog existing =
                getById(id);

        existing.setTitle(updated.getTitle());

        existing.setExcerpt(updated.getExcerpt());

        existing.setContent(updated.getContent());

        existing.setSeoTitle(updated.getSeoTitle());

        existing.setSeoDescription(
                updated.getSeoDescription()
        );

        existing.setKeywords(updated.getKeywords());

        existing.setThumbnailUrl(
                updated.getThumbnailUrl()
        );

        existing.setThumbnailPublicId(
                updated.getThumbnailPublicId()
        );

        existing.setTags(updated.getTags());

        existing.setCategories(
                updated.getCategories()
        );

        existing.setFeatured(
                updated.isFeatured()
        );

        existing.setStatus(
                updated.getStatus()
        );

        existing.setUpdatedAt(new Date());

        /*
         * SLUG
         */
        existing.setSlug(
                generateSlug(
                        updated.getTitle()
                )
        );

        /*
         * READ TIME
         */
        existing.setReadTime(
                calculateReadTime(
                        updated.getContent()
                )
        );

        /*
         * PUBLISH DATE
         */
        if (
                updated.getStatus()
                        == BlogStatus.PUBLISHED
                        && existing.getPublishedAt() == null
        ) {

            existing.setPublishedAt(
                    new Date()
            );
        }

        return repository.save(existing);
    }

    /*
     * GET BY SLUG
     */
    public Blog getBySlug(
            String slug
    ) {

        return repository.findBySlug(slug)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Blog not found"
                        )
                );
    }

    /*
     * GET BY ID
     */
    public Blog getById(
            String id
    ) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Blog not found"
                        )
                );
    }

    /*
     * PAGINATED BLOGS
     */
    public Page<Blog> getBlogs(
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository
                .findByStatusOrderByPublishedAtDesc(
                        BlogStatus.PUBLISHED,
                        pageable
                );
    }

    /*
     * SEARCH
     */
    public Page<Blog> search(
            String keyword,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        return repository.searchBlogs(
                keyword,
                pageable
        );
    }

    /*
     * RELATED BLOGS
     */
    public List<Blog> getRelatedBlogs(
            String slug
    ) {

        Blog blog = getBySlug(slug);

        if (blog.getTags() == null) {

            return List.of();
        }

        return repository.findTop4ByTagsInAndIdNot(
                blog.getTags(),
                blog.getId()
        );
    }

    /*
     * DELETE
     */
    public void delete(
            String id
    ) {

        Blog blog = getById(id);

        repository.delete(blog);
    }

    /*
     * SLUG GENERATOR
     */
    private String generateSlug(
            String title
    ) {

        return title
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }

    /*
     * READ TIME
     */
    private int calculateReadTime(
            String content
    ) {

        if (content == null
                || content.isBlank()) {

            return 1;
        }

        int words =
                content.split("\\s+").length;

        return Math.max(
                1,
                words / 200
        );
    }
}