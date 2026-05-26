package com.portfolio.project.repository;

import com.portfolio.project.model.Blog;
import com.portfolio.project.model.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BlogRepository
        extends MongoRepository<Blog, String> {

    /*
     * PUBLISHED BLOGS
     */
    Page<Blog> findByStatusOrderByPublishedAtDesc(
            BlogStatus status,
            Pageable pageable
    );

    /*
     * FEATURED BLOGS
     */
    Page<Blog> findByFeaturedTrueAndStatus(
            BlogStatus status,
            Pageable pageable
    );

    /*
     * SINGLE BLOG
     */
    Optional<Blog> findBySlug(
            String slug
    );

    /*
     * TAG SEARCH
     */
    Page<Blog> findByTagsContainingAndStatus(
            String tag,
            BlogStatus status,
            Pageable pageable
    );

    /*
     * CATEGORY SEARCH
     */
    Page<Blog> findByCategoriesContainingAndStatus(
            String category,
            BlogStatus status,
            Pageable pageable
    );

    /*
     * TEXT SEARCH
     */
    @Query("{ $text: { $search: ?0 }, status: 'PUBLISHED' }")
    Page<Blog> searchBlogs(
            String keyword,
            Pageable pageable
    );

    /*
     * RELATED BLOGS
     */
    List<Blog> findTop4ByTagsInAndIdNot(
            List<String> tags,
            String id
    );

    /*
     * DASHBOARD
     */
    long countByStatus(
            BlogStatus status
    );

    List<Blog>
    findTop5ByStatusOrderByCreatedAtDesc(
            BlogStatus status
    );
}