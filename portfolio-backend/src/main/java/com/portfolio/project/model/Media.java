package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Data
@Document(collection = "media")
public class Media {

    @Id
    private String id;

    /*
     * RELATIONS
     */
    @Field(write = Field.Write.ALWAYS)
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
    private VisibilityType visibility = VisibilityType.PUBLIC;

    /*
     * META
     */
    private long size;

    private String format;

    /*
     * TIMESTAMPS
     */
    private Date createdAt;

    /*
     * Helper method to check if this is standalone media
     */
    public boolean isStandalone() {
        return projectId == null || projectId.trim().isEmpty();
    }
}