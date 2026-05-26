package com.portfolio.project.service;

import com.portfolio.project.model.AuditLog;
import com.portfolio.project.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogService(
            AuditLogRepository repository
    ) {
        this.repository = repository;
    }

    /*
     * CREATE LOG
     */
    public void log(
            String action,
            String actor,
            String targetId,
            String details
    ) {

        AuditLog log =
                new AuditLog();

        log.setAction(action);

        log.setActor(actor);

        log.setTargetId(targetId);

        log.setDetails(details);

        log.setCreatedAt(new Date());

        repository.save(log);
    }

    /*
     * GET RECENT LOGS
     */
    public List<AuditLog> getRecentLogs() {

        return repository
                .findTop50ByOrderByCreatedAtDesc();
    }
}