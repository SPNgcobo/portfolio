package com.portfolio.project.repository;

import com.portfolio.project.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    /**
     * Public project comments
     */
    List<Comment> findByProjectIdAndApprovedTrueOrderByCreatedAtAsc(String projectId);

    /**
     * Pending comments for moderation
     */
    List<Comment> findByApprovedFalseAndDeletedFalse();

    /**
     * Admin view
     */
    List<Comment> findAllByOrderByCreatedAtDesc();
}