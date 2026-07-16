package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Tag;
import com.portfolio.project.service.TagService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public ApiResponse<List<Tag>> getAllTags() {
        return new ApiResponse<>(true, "Tags fetched", tagService.getAllTags());
    }

    @GetMapping("/popular")
    public ApiResponse<List<Tag>> getPopularTags() {
        return new ApiResponse<>(true, "Popular tags fetched", tagService.getPopularTags());
    }

    @GetMapping("/{id}")
    public ApiResponse<Tag> getTag(@PathVariable String id) {
        return new ApiResponse<>(true, "Tag fetched", tagService.getTag(id));
    }

    @PostMapping("/admin")
    public ApiResponse<Tag> createTag(@RequestBody Tag tag) {
        return new ApiResponse<>(true, "Tag created", tagService.createTag(tag));
    }

    @PutMapping("/admin/{id}")
    public ApiResponse<Tag> updateTag(@PathVariable String id, @RequestBody Tag tag) {
        return new ApiResponse<>(true, "Tag updated", tagService.updateTag(id, tag));
    }

    @DeleteMapping("/admin/{id}")
    public ApiResponse<Void> deleteTag(@PathVariable String id) {
        tagService.deleteTag(id);
        return new ApiResponse<>(true, "Tag deleted", null);
    }
}