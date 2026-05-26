package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String title;
    private String message;

    // banner | alert | update
    private String type;

    private boolean active = true;

    private Date createdAt;
}