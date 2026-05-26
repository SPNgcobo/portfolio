package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    /*
     * RELATION
     */
    private String projectId;

    /*
     * USER INFO
     */
    private String username;

    private String email;

    /*
     * COMMENT CONTENT
     */
    private String content;

    /*
     * THREADING
     */
    private String parentCommentId;

    /*
     * ADMIN REPLY FLAG
     */
    private boolean adminReply = false;

    /*
     * MODERATION
     */
    private boolean approved = false;

    /*
     * TIMESTAMPS
     */
    private Date createdAt;
}