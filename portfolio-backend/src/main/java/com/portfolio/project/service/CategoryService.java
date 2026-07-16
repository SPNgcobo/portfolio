package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.project.model.Category;
import com.portfolio.project.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(Category category) {
        category.setSlug(generateSlug(category.getName()));
        category.setUsageCount(0);
        category.setCreatedAt(new Date());
        category.setUpdatedAt(new Date());
        return categoryRepository.save(category);
    }

    public Category updateCategory(String id, Category updatedCategory) {
        Category existing = getCategory(id);
        existing.setName(updatedCategory.getName());
        existing.setSlug(generateSlug(updatedCategory.getName()));
        existing.setDescription(updatedCategory.getDescription());
        existing.setIcon(updatedCategory.getIcon());
        existing.setUpdatedAt(new Date());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(String id) {
        Category category = getCategory(id);
        categoryRepository.delete(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    public List<Category> getPopularCategories() {
        return categoryRepository.findAllByOrderByUsageCountDesc();
    }

    public Category getCategory(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    public void incrementUsage(String categoryId) {
        Category category = getCategory(categoryId);
        category.setUsageCount(category.getUsageCount() + 1);
        category.setUpdatedAt(new Date());
        categoryRepository.save(category);
    }

    public void decrementUsage(String categoryId) {
        Category category = getCategory(categoryId);
        category.setUsageCount(Math.max(0, category.getUsageCount() - 1));
        category.setUpdatedAt(new Date());
        categoryRepository.save(category);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}