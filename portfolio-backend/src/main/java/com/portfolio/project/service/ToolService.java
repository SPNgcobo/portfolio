package com.portfolio.project.service;

import com.portfolio.project.model.Tool;
import com.portfolio.project.repository.ToolRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToolService {

    private final ToolRepository repository;

    public ToolService(
            ToolRepository repository
    ) {
        this.repository = repository;
    }

    public Tool create(
            Tool tool
    ) {

        return repository.save(tool);
    }

    public List<Tool> getAll() {

        return repository.findAll();
    }
}