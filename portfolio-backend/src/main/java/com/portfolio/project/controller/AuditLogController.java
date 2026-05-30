package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.AuditLog;
import com.portfolio.project.service.AuditLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(
            AuditLogService service
    ) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<AuditLog>>
    getLogs() {

        return new ApiResponse<>(
                true,
                "Audit logs fetched",
                service.getRecentLogs()
        );
    }
}