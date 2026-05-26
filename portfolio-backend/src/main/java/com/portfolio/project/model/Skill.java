package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "skills")
public class Skill {

    @Id
    private String id;

    private String name;

    private String description;

    /*
     * ICON URL
     */
    private String icon;

    /*
     * DISPLAY ORDER
     */
    private int priority;
}