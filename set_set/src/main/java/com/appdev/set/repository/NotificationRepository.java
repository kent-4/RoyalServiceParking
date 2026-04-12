package com.appdev.set.repository;

import com.appdev.set.model.Notification;
import com.appdev.set.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    List<Notification> findByUserIsNullOrderByCreatedAtDesc();
    long countByUserAndIsReadFalse(User user);
    void deleteByUser(User user);
} 