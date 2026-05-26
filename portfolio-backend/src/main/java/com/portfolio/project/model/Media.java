package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "media")
public class Media {

    @Id
    private String id;

    /*
     * RELATIONS
     */
    private String projectId;

    /*
     * CONTENT
     */
    private String title;

    private String description;

    /*
     * MEDIA
     */
    private String url;

    private String publicId;

    private MediaType type;

    /*
     * SECURITY
     */
    private VisibilityType visibility =
            VisibilityType.PUBLIC;

    /*
     * META
     */
    private long size;

    private String format;

    /*
     * TIMESTAMPS
     */
    private Date createdAt;
}