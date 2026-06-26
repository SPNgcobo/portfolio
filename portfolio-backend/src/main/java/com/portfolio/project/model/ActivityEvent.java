package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "activity_events")
public class ActivityEvent {
    @Id
    private String id;
    private String type;
    private String message;
    private String userId;
    private String userName;
    private String targetUrl;
    private String targetId;
    private Date createdAt;
    private boolean read;
    private boolean userNotification;
}