package com.portfolio.analytics.repository;

import com.portfolio.analytics.model.Visitor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VisitorRepository
        extends MongoRepository<Visitor, String> {

    Optional<Visitor>
    findByFingerprint(
            String fingerprint
    );
}