package com.portfolio.project.repository;

import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.model.AccessStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AccessRequestRepository
        extends MongoRepository<AccessRequest, String> {

    /*
     * FIND BY STATUS
     */
    List<AccessRequest> findByStatus(
            AccessStatus status
    );

    /*
     * FIND USER REQUESTS
     */
    List<AccessRequest> findByEmail(
            String email
    );

    /*
     * PROJECT ACCESS
     */
    boolean existsByEmailAndProjectIdAndStatus(
            String email,
            String projectId,
            AccessStatus status
    );

    /*
     * MEDIA ACCESS
     */
    boolean existsByEmailAndMediaIdAndStatus(
            String email,
            String mediaId,
            AccessStatus status
    );
}