package com.portfolio.auth.dto;

import lombok.Data;

@Data
public class DeleteAccountRequest {
    private String reason;
    private String feedback;
}