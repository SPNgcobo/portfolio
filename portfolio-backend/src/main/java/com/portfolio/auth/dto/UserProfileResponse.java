package com.portfolio.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String role;
    private Date createdAt;
    private Date updatedAt;
    private Date passwordLastChanged;
}