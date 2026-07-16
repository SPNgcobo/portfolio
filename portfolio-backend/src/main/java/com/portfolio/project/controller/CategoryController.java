package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Category;
import com.portfolio.project.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<Category>> getAllCategories() {
        return new ApiResponse<>(true, "Categories fetched", categoryService.getAllCategories());
    }

    @GetMapping("/popular")
    public ApiResponse<List<Category>> getPopularCategories() {
        return new ApiResponse<>(true, "Popular categories fetched", categoryService.getPopularCategories());
    }

    @GetMapping("/{id}")
    public ApiResponse<Category> getCategory(@PathVariable String id) {
        return new ApiResponse<>(true, "Category fetched", categoryService.getCategory(id));
    }

    @PostMapping("/admin")
    public ApiResponse<Category> createCategory(@RequestBody Category category) {
        return new ApiResponse<>(true, "Category created", categoryService.createCategory(category));
    }

    @PutMapping("/admin/{id}")
    public ApiResponse<Category> updateCategory(@PathVariable String id, @RequestBody Category category) {
        return new ApiResponse<>(true, "Category updated", categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/admin/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return new ApiResponse<>(true, "Category deleted", null);
    }
}