package com.portfolio.project.repository;

import com.portfolio.project.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends MongoRepository<Tag, String> {
    Optional<Tag> findBySlug(String slug);
    Optional<Tag> findByNameIgnoreCase(String name);
    List<Tag> findAllByOrderByUsageCountDesc();
    List<Tag> findAllByOrderByNameAsc();
}