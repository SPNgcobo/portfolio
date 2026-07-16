package com.portfolio.project.service;

import com.portfolio.common.exceptions.ResourceNotFoundException;
import com.portfolio.project.model.Tag;
import com.portfolio.project.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public Tag createTag(Tag tag) {
        tag.setSlug(generateSlug(tag.getName()));
        tag.setUsageCount(0);
        tag.setCreatedAt(new Date());
        tag.setUpdatedAt(new Date());
        return tagRepository.save(tag);
    }

    public Tag updateTag(String id, Tag updatedTag) {
        Tag existing = getTag(id);
        existing.setName(updatedTag.getName());
        existing.setSlug(generateSlug(updatedTag.getName()));
        existing.setDescription(updatedTag.getDescription());
        existing.setUpdatedAt(new Date());
        return tagRepository.save(existing);
    }

    public void deleteTag(String id) {
        Tag tag = getTag(id);
        tagRepository.delete(tag);
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAllByOrderByNameAsc();
    }

    public List<Tag> getPopularTags() {
        return tagRepository.findAllByOrderByUsageCountDesc();
    }

    public Tag getTag(String id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
    }

    public void incrementUsage(String tagId) {
        Tag tag = getTag(tagId);
        tag.setUsageCount(tag.getUsageCount() + 1);
        tag.setUpdatedAt(new Date());
        tagRepository.save(tag);
    }

    public void decrementUsage(String tagId) {
        Tag tag = getTag(tagId);
        tag.setUsageCount(Math.max(0, tag.getUsageCount() - 1));
        tag.setUpdatedAt(new Date());
        tagRepository.save(tag);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}