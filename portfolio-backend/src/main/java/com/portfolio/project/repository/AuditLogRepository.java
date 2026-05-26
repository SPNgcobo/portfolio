package com.portfolio.project.repository;

import com.portfolio.project.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AuditLogRepository
        extends MongoRepository<AuditLog, String> {

    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
}