package com.portfolio.project.dto;

import lombok.Data;

@Data
public class ContactMessageRequest {

    private String name;

    private String email;

    private String subject;

    private String message;
}