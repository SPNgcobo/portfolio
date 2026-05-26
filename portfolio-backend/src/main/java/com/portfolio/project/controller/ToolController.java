package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Tool;
import com.portfolio.project.service.ToolService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tools")
@CrossOrigin(origins = "*")
public class ToolController {

    private final ToolService service;

    public ToolController(
            ToolService service
    ) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<Tool> create(
            @RequestBody Tool tool
    ) {

        return new ApiResponse<>(
                true,
                "Tool created",
                service.create(tool)
        );
    }

    @GetMapping
    public ApiResponse<List<Tool>> getAll() {

        return new ApiResponse<>(
                true,
                "Tools fetched",
                service.getAll()
        );
    }
}