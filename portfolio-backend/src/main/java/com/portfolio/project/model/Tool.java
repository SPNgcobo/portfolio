package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "tools")
public class Tool {

    @Id
    private String id;

    private String name;

    private String description;

    private String icon;

    private int priority;
}