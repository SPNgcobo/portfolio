package com.portfolio.project.dto;

import com.portfolio.project.model.MediaType;
import com.portfolio.project.model.VisibilityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecureMediaResponse {

    private String id;

    private String title;

    private String description;

    private String url;

    private MediaType type;

    private VisibilityType visibility;
}