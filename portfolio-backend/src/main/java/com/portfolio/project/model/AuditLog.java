package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    /*
     * EVENT TYPE
     *
     * COMMENT_APPROVED
     * COMMENT_DELETED
     * PROJECT_CREATED
     * PROJECT_UPDATED
     * PROJECT_DELETED
     * NOTIFICATION_CREATED
     */
    private String action;

    /*
     * ADMIN / USER
     */
    private String actor;

    /*
     * TARGET ENTITY
     */
    private String targetId;

    /*
     * DETAILS
     */
    private String details;

    /*
     * TIMESTAMP
     */
    private Date createdAt;
}