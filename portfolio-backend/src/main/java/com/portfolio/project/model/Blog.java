package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "blogs")
public class Blog {

    @Id
    private String id;

    /*
     * CONTENT
     */
    @TextIndexed
    private String title;

    @TextIndexed
    private String excerpt;

    @TextIndexed
    private String content;

    /*
     * SEO
     */
    private String slug;

    private String seoTitle;

    private String seoDescription;

    private List<String> keywords;

    /*
     * MEDIA
     */
    private String thumbnailUrl;

    private String thumbnailPublicId;

    /*
     * ORGANIZATION
     */
    private List<String> tags;

    private List<String> categories;

    /*
     * STATUS
     */
    private BlogStatus status =
            BlogStatus.DRAFT;

    /*
     * FEATURES
     */
    private boolean featured = false;

    private int readTime;

    /*
     * META
     */
    private Date publishedAt;

    private Date createdAt;

    private Date updatedAt;
}