package com.unleashed.entity;

import com.unleashed.entity.composite.NotificationUserId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notification_user", schema = "dbo")
public class NotificationUser {
    @EmbeddedId
    private NotificationUserId id;

    @Column(name = "is_notification_viewed")
    private Boolean isNotificationViewed;

    @Column(name = "is_notification_deleted")
    private Boolean isNotificationDeleted;

}