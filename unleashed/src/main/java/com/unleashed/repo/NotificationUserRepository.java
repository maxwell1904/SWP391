package com.unleashed.repo;

import com.unleashed.entity.composite.NotificationUserId;
import com.unleashed.entity.NotificationUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface NotificationUserRepository extends JpaRepository<NotificationUser, NotificationUserId> {

    List<NotificationUser> findByIdUserId(UUID userId);

    @Modifying
    @Transactional
    @Query("UPDATE NotificationUser nu SET nu.isNotificationDeleted = true WHERE nu.id.notificationId IN :notificationIds")
    int markNotificationAsDeleted(@Param("notificationIds") List<Integer> notificationIds);

    @Query("SELECT nu FROM NotificationUser nu WHERE nu.id.notificationId = :notificationId")
    List<NotificationUser> findByNotificationId(@Param("notificationId") Integer notificationId);

    @Modifying
    @Query("DELETE FROM NotificationUser nu WHERE nu.id.notificationId = :notificationId")
    void deleteByNotificationId(@Param("notificationId") Integer notificationId);

    Page<NotificationUser> findByIdUserIdAndIsNotificationDeletedFalse(UUID userId, Pageable pageable);
}