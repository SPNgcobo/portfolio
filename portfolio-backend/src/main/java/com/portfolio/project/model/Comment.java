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
     * EDIT HISTORY
     */
    private String originalContent;
    private boolean edited = false;
    private Date editedAt;
    private int editCount = 0;

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

    /*
     * DELETED FLAG
     */
    private boolean deleted = false;
    private Date deletedAt;

    /*
     * Who deleted this comment
     */
    private String deletedBy;
}