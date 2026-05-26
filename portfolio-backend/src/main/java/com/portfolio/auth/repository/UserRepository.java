package com.portfolio.auth.repository;

import com.portfolio.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository
        extends MongoRepository<User, String> {

    Optional<User> findByEmail(
            String email
    );

    boolean existsByEmail(
            String email
    );

    Optional<User> findByRefreshToken(
            String refreshToken
    );

    Optional<User> findByPasswordResetToken(
            String token
    );
}