package com.unleashed.repo;

import com.unleashed.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findAllByOrderByIdDesc();

    @Query(value =
            "SELECT * FROM notification n " +
                    "WHERE n.user_id_sender = :userId " +
                    "ORDER BY n.notification_id DESC",
            nativeQuery = true)
    List<Notification> findAllByUserIdSender(@Param("userId") UUID userId);
}