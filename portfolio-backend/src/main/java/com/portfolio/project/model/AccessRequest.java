package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "access_requests")
public class AccessRequest {

    @Id
    private String id;

    /*
     * USER INFO
     */
    private String name;

    private String email;

    private String company;

    private String reason;

    /*
     * TARGET
     */
    private String mediaId;

    private String projectId;

    /*
     * STATUS
     */
    private AccessStatus status =
            AccessStatus.PENDING;

    /*
     * ADMIN RESPONSE
     */
    private String adminMessage;

    /*
     * TIMESTAMPS
     */
    private Date createdAt;

    private Date updatedAt;
}