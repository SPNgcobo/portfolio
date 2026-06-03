package com.portfolio.project.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "project_engagements")
@CompoundIndex(
        def = "{'projectId':1,'fingerprint':1,'type':1}",
        unique = true
)
public class ProjectEngagement {

    @Id
    private String id;

    private String projectId;

    /*
     * LIKE
     * VIEW
     * GITHUB_CLICK
     * DEMO_CLICK
     */
    private String type;

    private String fingerprint;

    private Date createdAt;
}