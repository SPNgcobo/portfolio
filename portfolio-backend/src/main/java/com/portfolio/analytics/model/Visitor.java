package com.portfolio.analytics.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "visitors")
public class Visitor {

    @Id
    private String id;

    /*
     * UNIQUE DEVICE FINGERPRINT
     */
    private String fingerprint;

    /*
     * NETWORK
     */
    private String ipAddress;

    /*
     * DEVICE INFO
     */
    private String userAgent;

    private String browser;

    private String operatingSystem;

    private String deviceType;

    /*
     * PAGE
     */
    private String page;

    /*
     * VISITS
     */
    private long totalVisits;

    /*
     * TIMESTAMPS
     */
    private Date firstVisitAt;

    private Date lastVisitAt;
}