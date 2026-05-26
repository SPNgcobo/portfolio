package com.portfolio.project.service;

import com.portfolio.project.model.Skill;
import com.portfolio.project.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository repository;

    public SkillService(
            SkillRepository repository
    ) {
        this.repository = repository;
    }

    public Skill create(
            Skill skill
    ) {

        return repository.save(skill);
    }

    public List<Skill> getAll() {

        return repository.findAll();
    }
}