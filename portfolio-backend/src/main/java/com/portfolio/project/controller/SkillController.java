package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.model.Skill;
import com.portfolio.project.service.SkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
public class SkillController {

    private final SkillService service;

    public SkillController(
            SkillService service
    ) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<Skill> create(
            @RequestBody Skill skill
    ) {

        return new ApiResponse<>(
                true,
                "Skill created",
                service.create(skill)
        );
    }

    @GetMapping
    public ApiResponse<List<Skill>> getAll() {

        return new ApiResponse<>(
                true,
                "Skills fetched",
                service.getAll()
        );
    }
}