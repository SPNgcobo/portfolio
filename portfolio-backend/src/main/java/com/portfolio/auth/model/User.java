package com.portfolio.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String username;

    private String email;

    private String password;

    private Role role;

    /*
     * REFRESH TOKEN
     */
    private String refreshToken;

    private Date refreshTokenExpiry;

    /*
     * ACCOUNT SECURITY
     */
    private int failedLoginAttempts = 0;

    private boolean accountLocked = false;

    private Date lockoutEndTime;

    /*
     * PASSWORD RESET
     */
    private String passwordResetToken;

    private Date passwordResetExpiry;

    /*
     * TIMESTAMPS
     */
    private Date createdAt;

    private Date updatedAt;

    /*
     * PASSWORD LAST CHANGED
     */
    private Date passwordLastChanged;
}