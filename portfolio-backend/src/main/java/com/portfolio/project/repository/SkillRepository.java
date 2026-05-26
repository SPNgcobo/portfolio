package com.portfolio.project.repository;

import com.portfolio.project.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SkillRepository
        extends MongoRepository<Skill, String> {
}