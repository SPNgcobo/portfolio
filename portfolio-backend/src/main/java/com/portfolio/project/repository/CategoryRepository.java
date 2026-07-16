package com.portfolio.project.repository;

import com.portfolio.project.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findAllByOrderByUsageCountDesc();
    List<Category> findAllByOrderByNameAsc();
}