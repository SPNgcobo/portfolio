package com.portfolio.project.repository;

import com.portfolio.project.model.ActivityEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityEventRepository extends MongoRepository<ActivityEvent, String> {
    List<ActivityEvent> findAllByOrderByCreatedAtDesc();
    long countByReadFalse();
    List<ActivityEvent> findByReadFalse();
    List<ActivityEvent> findByReadTrue();
    List<ActivityEvent> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndReadFalse(String userId);
    List<ActivityEvent> findByUserIdAndReadFalse(String userId);
    List<ActivityEvent> findByUserIdAndUserNotificationTrue(String userId);
}