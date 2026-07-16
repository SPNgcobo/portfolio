package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "tags")
public class Tag {
    @Id
    private String id;
    private String name;
    private String slug;
    private String description;
    private int usageCount;
    private Date createdAt;
    private Date updatedAt;
}