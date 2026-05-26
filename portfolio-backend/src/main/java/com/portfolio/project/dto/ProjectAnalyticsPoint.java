package com.portfolio.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProjectAnalyticsPoint {

    private String label;

    private long value;
}