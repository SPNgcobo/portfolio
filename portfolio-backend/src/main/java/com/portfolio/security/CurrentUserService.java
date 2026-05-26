package com.portfolio.security;

import com.portfolio.auth.model.User;
import com.portfolio.auth.repository.UserRepository;
import com.portfolio.common.exceptions.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(
            UserRepository userRepository
    ) {

        this.userRepository = userRepository;
    }

    /*
     * CURRENT USER
     */
    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {

            throw new AuthenticationException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new AuthenticationException(
                                "User not found"
                        )
                );
    }
}