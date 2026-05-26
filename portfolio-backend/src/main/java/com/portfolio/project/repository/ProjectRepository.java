package com.portfolio.project.repository;

import com.portfolio.project.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository
        extends MongoRepository<Project, String> {

    /*
     * TEXT SEARCH
     */
    @Query("{ $text: { $search: ?0 }, published: true }")
    Page<Project> searchProjects(
            String keyword,
            Pageable pageable
    );

    /*
     * FEATURED + PUBLISHED
     */
    Page<Project>
    findByFeaturedTrueAndPublishedTrue(
            Pageable pageable
    );

    /*
     * PUBLISHED
     */
    Page<Project> findByPublishedTrue(
            Pageable pageable
    );

    List<Project> findByPublishedTrue();

    Optional<Project>
    findByIdAndPublishedTrue(String id);

    /*
     * UNPUBLISHED
     */
    Page<Project> findByPublishedFalse(
            Pageable pageable
    );

    /*
     * FEATURED
     */
    Page<Project> findByFeaturedTrue(
            Pageable pageable
    );

    /*
     * TECH STACK FILTER
     */
    Page<Project> findByTechStackContainingIgnoreCase(
            String tech,
            Pageable pageable
    );

    /*
     * TOOLS FILTER
     */
    Page<Project> findByToolsContainingIgnoreCase(
            String tool,
            Pageable pageable
    );

    /*
     * RELATED PROJECTS
     */
    List<Project> findTop4ByTechStackInAndIdNot(
            List<String> techStack,
            String id
    );

    /*
     * DASHBOARD
     */
    long countByFeaturedTrue();

    List<Project> findTop5ByOrderByCreatedAtDesc();
}