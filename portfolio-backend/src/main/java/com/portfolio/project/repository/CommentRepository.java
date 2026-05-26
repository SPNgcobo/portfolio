package com.portfolio.project.repository;

import com.portfolio.project.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByProjectIdAndApprovedTrue(String projectId);

    List<Comment> findByApprovedFalse();
}