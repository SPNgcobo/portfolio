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
     * TARGET - Can be project-based or media-based
     *  If projectId is set, user gets access to ALL vault media for that project
     *  If mediaId is set AND projectId is null, user gets access to that specific media (standalone)
     */
    private String mediaId;
    private String projectId;

    /*
     * REQUEST TYPE
     *  PROJECT: Request access to all vault media in a project
     *  MEDIA: Request access to a specific media file (standalone)
     */
    private AccessRequestType requestType = AccessRequestType.PROJECT;

    /*
     * STATUS
     */
    private AccessStatus status = AccessStatus.PENDING;

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