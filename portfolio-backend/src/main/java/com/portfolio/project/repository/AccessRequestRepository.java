package com.portfolio.project.repository;

import com.portfolio.project.model.AccessRequest;
import com.portfolio.project.model.AccessStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AccessRequestRepository
        extends MongoRepository<AccessRequest, String> {

    /*
     * FIND BY STATUS
     */
    List<AccessRequest> findByStatus(AccessStatus status);

    /*
     * FIND USER REQUESTS BY EMAIL
     */
    List<AccessRequest> findByEmail(String email);

    /*
     * FIND REQUESTS BY EMAIL AND PROJECT ID
     */
    Optional<AccessRequest> findByEmailAndProjectId(
            String email,
            String projectId
    );

    /*
     * FIND REQUESTS BY EMAIL AND MEDIA ID - Returns Optional (single result)
     */
    Optional<AccessRequest> findByEmailAndMediaId(
            String email,
            String mediaId
    );

    /*
     * FIND ALL REQUESTS BY EMAIL AND MEDIA ID - Returns List (multiple results)
     */
    List<AccessRequest> findAllByEmailAndMediaId(
            String email,
            String mediaId
    );

    /*
     * CHECK IF USER HAS A REQUEST FOR A PROJECT (ANY STATUS)
     */
    boolean existsByEmailAndProjectId(
            String email,
            String projectId
    );

    /*
     * CHECK IF USER HAS A REQUEST FOR A MEDIA (ANY STATUS)
     */
    boolean existsByEmailAndMediaId(
            String email,
            String mediaId
    );

    /*
     * CHECK IF USER HAS A REQUEST WITH SPECIFIC STATUS FOR A PROJECT
     */
    boolean existsByEmailAndProjectIdAndStatus(
            String email,
            String projectId,
            AccessStatus status
    );

    /*
     * CHECK IF USER HAS A REQUEST WITH SPECIFIC STATUS FOR A MEDIA
     */
    boolean existsByEmailAndMediaIdAndStatus(
            String email,
            String mediaId,
            AccessStatus status
    );

    /*
     * CHECK IF USER HAS APPROVED ACCESS TO A PROJECT
     */
    default boolean hasApprovedProjectAccess(String email, String projectId) {
        return existsByEmailAndProjectIdAndStatus(
                email,
                projectId,
                AccessStatus.APPROVED
        );
    }

    /*
     * CHECK IF USER HAS APPROVED ACCESS TO A MEDIA
     */
    default boolean hasApprovedMediaAccess(String email, String mediaId) {
        return existsByEmailAndMediaIdAndStatus(
                email,
                mediaId,
                AccessStatus.APPROVED
        );
    }

    /*
     * FIND BY EMAIL AND PROJECT ID WITH STATUS
     */
    Optional<AccessRequest> findByEmailAndProjectIdAndStatus(
            String email,
            String projectId,
            AccessStatus status
    );

    /*
     * FIND BY EMAIL AND MEDIA ID WITH STATUS
     */
    Optional<AccessRequest> findByEmailAndMediaIdAndStatus(
            String email,
            String mediaId,
            AccessStatus status
    );
}