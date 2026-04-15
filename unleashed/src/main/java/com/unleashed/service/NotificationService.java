package com.unleashed.service;

import com.unleashed.dto.NotificationDTO;
import com.unleashed.entity.composite.NotificationUserId;
import com.unleashed.entity.Notification;
import com.unleashed.entity.NotificationUser;
import com.unleashed.entity.User;
import com.unleashed.repo.NotificationRepository;
import com.unleashed.repo.NotificationUserRepository;
import com.unleashed.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationUserRepository notificationUserRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, NotificationUserRepository notificationUserRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationUserRepository = notificationUserRepository;
    }

    // --- HELPER METHOD ---

    private NotificationDTO convertToDto(Notification notification, NotificationUser notificationUser) {
        if (notification == null) return null;

        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(notification.getId());
        dto.setNotificationTitle(notification.getNotificationTitle());
        dto.setUserName(notification.getUserIdSender() != null ? notification.getUserIdSender().getUsername() : "System");

        String rawContent = notification.getNotificationContent();
        String[] parts = rawContent.split("\\|");
        if (parts.length == 3) {
            dto.setNotificationContent(parts[0]);
            dto.setNotificationLink("/shop/product/" + parts[1] + "?replyId=" + parts[2]);
        } else {
            dto.setNotificationContent(rawContent);
            dto.setNotificationLink(null);
        }

        if(notificationUser != null) {
            dto.setNotificatonViewed(notificationUser.getIsNotificationViewed());
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        dto.setCreatedAt(notification.getNotificationCreatedAt() != null ? notification.getNotificationCreatedAt().format(formatter) : "No Date");

        return dto;
    }

    // --- CUSTOMER-FACING METHODS ---

    public List<NotificationDTO> getLatestNotificationsForCustomer(String username) {
        User user = userRepository.findByUserUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id.notificationId").descending());
        Page<NotificationUser> notificationUsersPage = notificationUserRepository.findByIdUserIdAndIsNotificationDeletedFalse(user.getUserId(), pageable);
        return notificationUsersPage.getContent().stream()
                .map(nu -> convertToDto(notificationRepository.findById(nu.getId().getNotificationId()).orElse(null), nu))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public Page<NotificationDTO> getAllNotificationsForCustomer(String username, int page, int size) {
        User user = userRepository.findByUserUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("id.notificationId").descending());
        Page<NotificationUser> notificationUsersPage = notificationUserRepository.findByIdUserIdAndIsNotificationDeletedFalse(user.getUserId(), pageable);
        List<NotificationDTO> dtos = notificationUsersPage.getContent().stream()
                .map(nu -> convertToDto(notificationRepository.findById(nu.getId().getNotificationId()).orElse(null), nu))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, notificationUsersPage.getTotalElements());
    }

    @Transactional
    public void markNotificationAsViewed(Integer notificationId, String username) {
        User user = userRepository.findByUserUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        NotificationUserId id = new NotificationUserId(notificationId, user.getUserId());
        NotificationUser notificationUser = notificationUserRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification for user not found"));
        notificationUser.setIsNotificationViewed(true);
        notificationUserRepository.save(notificationUser);
    }

    @Transactional
    public void deleteNotificationForCustomer(Integer notificationId, String username) {
        User user = userRepository.findByUserUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        NotificationUserId id = new NotificationUserId(notificationId, user.getUserId());
        NotificationUser notificationUser = notificationUserRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification for user not found"));
        notificationUser.setIsNotificationDeleted(true); // Soft delete
        notificationUserRepository.save(notificationUser);
    }

    // --- ADMIN & STAFF METHODS (RESTORED) ---

    public List<NotificationDTO> getListNotificationDrawer() {
        return notificationRepository.findAllByOrderByIdDesc().stream()
                .filter(notification -> notification.getUserIdSender() == null || !"System-chan".equals(notification.getUserIdSender().getUsername()))
                .map(notification -> {
                    NotificationDTO dto = new NotificationDTO();
                    dto.setNotificationId(notification.getId());
                    dto.setNotificationTitle(notification.getNotificationTitle());
                    dto.setNotificationContent(notification.getNotificationContent());

                    if (notification.getUserIdSender() != null) {
                        dto.setUserName(notification.getUserIdSender().getUsername());
                    } else {
                        dto.setUserName("Unknown");
                    }

                    dto.setNotificationDraft(notification.getIsNotificationDraft());
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
                    dto.setCreatedAt(notification.getNotificationCreatedAt() != null ? notification.getNotificationCreatedAt().format(formatter) : "No Date");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponseEntity<?> addNotification(NotificationDTO notificationDTO) {
        User sender = userRepository.findByUserUsername(notificationDTO.getUserName())
                .orElseThrow(() -> new RuntimeException("Sender user not found: " + notificationDTO.getUserName()));

        Notification notification = new Notification();
        notification.setNotificationTitle(notificationDTO.getNotificationTitle());
        notification.setNotificationContent(notificationDTO.getNotificationContent());
        notification.setUserIdSender(sender);
        notification.setIsNotificationDraft(notificationDTO.getNotificationDraft() != null ? notificationDTO.getNotificationDraft() : false);

        Notification savedNotification = notificationRepository.save(notification);

        List<String> notFoundUsers = new ArrayList<>();
        if (notificationDTO.getUserNames() != null && !notificationDTO.getUserNames().isEmpty()) {
            for (String userName : notificationDTO.getUserNames()) {
                userRepository.findByUserUsername(userName).ifPresentOrElse(recipient -> {
                    NotificationUser notificationUser = new NotificationUser();
                    notificationUser.setId(new NotificationUserId(savedNotification.getId(), recipient.getUserId()));
                    notificationUser.setIsNotificationViewed(false);
                    notificationUser.setIsNotificationDeleted(false);
                    notificationUserRepository.save(notificationUser);
                }, () -> notFoundUsers.add(userName));
            }
        }

        if (!notFoundUsers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Some recipients not found", "errors", notFoundUsers));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Notification created successfully"));
    }

    @Transactional
    public ResponseEntity<?> deleteNotification(Integer id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Notification not found with ID: " + id));
        }
        notificationUserRepository.deleteByNotificationId(id);
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Successfully deleted notification and related users"));
    }
}