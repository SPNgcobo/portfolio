package com.portfolio.project.repository;

import com.portfolio.project.model.Tool;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ToolRepository
        extends MongoRepository<Tool, String> {
}