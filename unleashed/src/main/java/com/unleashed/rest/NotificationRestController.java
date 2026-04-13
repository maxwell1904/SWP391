package com.unleashed.rest;

import com.unleashed.dto.NotificationDTO;
import com.unleashed.entity.Notification;
import com.unleashed.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationRestController {

    private final NotificationService notificationService;

    public NotificationRestController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // --- ADMIN & STAFF ENDPOINTS (RESTORED) ---

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/as")
    public ResponseEntity<List<NotificationDTO>> getDashboardNotifications() {
        List<NotificationDTO> notificationDTOs = notificationService.getListNotificationDrawer();
        return ResponseEntity.ok(notificationDTOs);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody NotificationDTO notification) {
        return notificationService.addNotification(notification);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Integer notificationId) {
        if (notificationId == null || notificationId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid notification ID"));
        }
        return notificationService.deleteNotification(notificationId);
    }


    // --- CUSTOMER ENDPOINTS (EXISTING) ---

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/customer/latest")
    public ResponseEntity<List<NotificationDTO>> getLatestNotificationsForCustomer(@RequestParam String username) {
        return ResponseEntity.ok(notificationService.getLatestNotificationsForCustomer(username));
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/customer/all")
    public ResponseEntity<Page<NotificationDTO>> getAllNotificationsForCustomer(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<NotificationDTO> notificationPage = notificationService.getAllNotificationsForCustomer(username, page, size);
        return ResponseEntity.ok(notificationPage);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PutMapping("/customer/view/{notificationId}")
    public ResponseEntity<?> markNotificationAsViewed(@PathVariable Integer notificationId, @RequestParam String username) {
        notificationService.markNotificationAsViewed(notificationId, username);
        return ResponseEntity.ok().body("Notification marked as viewed.");
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PutMapping("/customer/delete/{notificationId}")
    public ResponseEntity<?> deleteNotificationForCustomer(
            @PathVariable Integer notificationId,
            @RequestParam String username) {
        notificationService.deleteNotificationForCustomer(notificationId, username);
        return ResponseEntity.ok().body("Notification deleted for user.");
    }
}