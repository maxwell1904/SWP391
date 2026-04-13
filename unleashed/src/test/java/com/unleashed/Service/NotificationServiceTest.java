//package com.unleashed.Service;
//
//import com.unleashed.dto.NotificationDTO;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.NotificationUserId;
//import com.unleashed.repo.NotificationRepository;
//import com.unleashed.repo.NotificationUserRepository;
//import com.unleashed.repo.UserRepository;
//import com.unleashed.repo.UserRoleRepository;
//import com.unleashed.service.NotificationService;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.test.context.support.WithMockUser;
//
//import java.time.OffsetDateTime;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class NotificationServiceTest {
//
//    @Autowired
//    private NotificationService notificationService;
//
//    @MockBean
//    private NotificationRepository notificationRepository;
//
//
//    @MockBean
//    private UserRepository userRepository;
//
//    @MockBean
//    private NotificationUserRepository notificationUserRepository;
//
//    private List<Notification> notifications;
//    private User senderUser;
//    private User recipientUser1;
//    private User recipientUser2;
//    private Role roleCustomer;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        roleCustomer = createRole(1, "CUSTOMER");
//        senderUser = createUser("senderUserId", "senderUsername", roleCustomer);
//        recipientUser1 = createUser("recipientUserId1", "recipientUsername1", roleCustomer);
//        recipientUser2 = createUser("recipientUserId2", "recipientUsername2", roleCustomer);
//
//
//        notifications = Arrays.asList(
//                createNotification(1, "Notification 1", "Content 1", senderUser, false, OffsetDateTime.now()),
//                createNotification(2, "Notification 2", "Content 2", senderUser, true, OffsetDateTime.now().minusDays(1))
//        );
//    }
//
//    @Test
//    void getListNotification_ShouldReturnAllNotificationsOrderedByIdDesc() {
//        when(notificationRepository.findAllByOrderByIdDesc()).thenReturn(notifications);
//
//        List<Notification> result = notificationService.getListNotification();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(notifications.get(0).getId(), result.get(0).getId());
//        assertEquals(notifications.get(1).getId(), result.get(1).getId());
//        verify(notificationRepository, times(1)).findAllByOrderByIdDesc();
//    }
//
//    @Test
//    void getListNotificationDrawer_ShouldReturnNotificationDTOList() {
//        when(notificationRepository.findAllByOrderByIdDesc()).thenReturn(notifications);
//        when(userRepository.findByUserUsername(senderUser.getUsername())).thenReturn(Optional.of(senderUser));
//
//        List<NotificationDTO> result = notificationService.getListNotificationDrawer();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(notifications.get(0).getNotificationTitle(), result.get(0).getNotificationTitle());
//        assertEquals(notifications.get(1).getNotificationContent(), result.get(1).getNotificationContent());
//        assertEquals(senderUser.getUsername(), result.get(0).getUserName());
//        verify(notificationRepository, times(1)).findAllByOrderByIdDesc();
//    }
//
//    @Test
//    @WithMockUser(username = "recipientUsername1", authorities = { "CUSTOMER" })
//    void getActiveNotificationsForCustomer_UserExists_ShouldReturnActiveNotificationDTOList() {
//        String username = recipientUser1.getUsername();
//        NotificationUser notificationUser1 = createNotificationUser(notifications.get(0).getId(), recipientUser1.getUserId(), false, false);
//        List<NotificationUser> notificationUsers = Collections.singletonList(notificationUser1);
//
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(recipientUser1));
//        when(notificationUserRepository.findByIdUserId(recipientUser1.getUserId())).thenReturn(notificationUsers);
//        when(notificationRepository.findById(notifications.get(0).getId())).thenReturn(Optional.of(notifications.get(0)));
//
//        List<NotificationDTO> result = notificationService.getActiveNotificationsForCustomer(username);
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals(notifications.get(0).getNotificationTitle(), result.get(0).getNotificationTitle());
//        assertFalse(result.get(0).isNotificatonViewed());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, times(1)).findByIdUserId(recipientUser1.getUserId());
//        verify(notificationRepository, times(1)).findById(notifications.get(0).getId());
//    }
//
//    @Test
//    @WithMockUser(username = "recipientUsername1", authorities = { "CUSTOMER" })
//    void getActiveNotificationsForCustomer_UserNotFound_ShouldReturnEmptyList() {
//        String username = "nonExistentUser";
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.empty());
//
//        List<NotificationDTO> result = notificationService.getActiveNotificationsForCustomer(username);
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, never()).findByIdUserId(anyString());
//        verify(notificationRepository, never()).findById(anyInt());
//    }
//
//    @Test
//    void markAllNotificationsAsViewed_UserExists_ShouldMarkAllAsViewedAndReturnUpdatedList() {
//        String username = recipientUser1.getUsername();
//        NotificationUser notificationUser1 = createNotificationUser(notifications.get(0).getId(), recipientUser1.getUserId(), false, false);
//        List<NotificationUser> notificationUsers = Collections.singletonList(notificationUser1);
//
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(recipientUser1));
//        when(notificationUserRepository.findByIdUserId(recipientUser1.getUserId())).thenReturn(notificationUsers);
//        when(notificationRepository.findById(notifications.get(0).getId())).thenReturn(Optional.of(notifications.get(0)));
//        when(notificationUserRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
//
//        ResponseEntity<?> responseEntity = notificationService.markAllNotificationsAsViewed(username);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        List<NotificationDTO> updatedNotifications = (List<NotificationDTO>) responseEntity.getBody();
//        assertNotNull(updatedNotifications);
//        assertFalse(updatedNotifications.isEmpty());
//
//
//        verify(userRepository, times(2)).findByUserUsername(username);
//        verify(notificationUserRepository, times(2)).findByIdUserId(recipientUser1.getUserId());
//        verify(notificationUserRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void markAllNotificationsAsViewed_UserNotFound_ShouldReturnBadRequest() {
//        String username = "nonExistentUser";
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.markAllNotificationsAsViewed(username);
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//        assertEquals("User not found", responseEntity.getBody());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, never()).findByIdUserId(anyString());
//        verify(notificationUserRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void markNotificationAsViewed_UserAndNotificationExist_ShouldMarkAsViewedAndReturnUpdatedList() {
//        String username = recipientUser1.getUsername();
//        int notificationId = notifications.get(0).getId();
//        NotificationUserId notificationUserIdKey = new NotificationUserId(notificationId, recipientUser1.getUserId());
//        NotificationUser notificationUser = createNotificationUser(notificationId, recipientUser1.getUserId(), false, false);
//
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(recipientUser1));
//        when(notificationUserRepository.findById(notificationUserIdKey)).thenReturn(Optional.of(notificationUser));
//        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notifications.get(0)));
//        when(notificationUserRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
//
//        ResponseEntity<?> responseEntity = notificationService.markNotificationAsViewed(notificationId, username);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        List<NotificationDTO> updatedNotifications = (List<NotificationDTO>) responseEntity.getBody();
//        assertNotNull(updatedNotifications);
//        assertTrue(updatedNotifications.isEmpty());
//
//        verify(userRepository, times(2)).findByUserUsername(username);
//        verify(notificationUserRepository, times(1)).findById(notificationUserIdKey);
//        verify(notificationUserRepository, times(1)).save(any());
//    }
//
//    @Test
//    void markNotificationAsViewed_UserNotFound_ShouldReturnBadRequest() {
//        String username = "nonExistentUser";
//        int notificationId = 1;
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.markNotificationAsViewed(notificationId, username);
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//        assertEquals("User not found", responseEntity.getBody());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, never()).findById(any());
//        verify(notificationUserRepository, never()).save(any());
//    }
//
//    @Test
//    void markNotificationAsViewed_NotificationUserNotFound_ShouldReturnNotFound() {
//        String username = recipientUser1.getUsername();
//        int notificationId = 1;
//        NotificationUserId notificationUserIdKey = new NotificationUserId(notificationId, recipientUser1.getUserId());
//
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(recipientUser1));
//        when(notificationUserRepository.findById(notificationUserIdKey)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.markNotificationAsViewed(notificationId, username);
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertEquals("Notification not found for this user", responseEntity.getBody());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, times(1)).findById(notificationUserIdKey);
//        verify(notificationUserRepository, never()).save(any());
//    }
//
//
//    @Test
//    void deleteNotificationForCustomer_UserAndNotificationUserExist_ShouldMarkNotificationUserAsDeleted() {
//        String username = recipientUser1.getUsername();
//        int notificationId = notifications.get(0).getId();
//        NotificationUserId notificationUserIdKey = new NotificationUserId(notificationId, recipientUser1.getUserId());
//        NotificationUser notificationUser = createNotificationUser(notificationId, recipientUser1.getUserId(), false, false);
//
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(recipientUser1));
//        when(notificationUserRepository.findById(notificationUserIdKey)).thenReturn(Optional.of(notificationUser));
//        when(notificationUserRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
//
//        ResponseEntity<?> responseEntity = notificationService.deleteNotificationForCustomer(notificationId, username);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertEquals("Notification deleted", responseEntity.getBody());
//        assertTrue(notificationUser.getIsNotificationDeleted());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, times(1)).findById(notificationUserIdKey);
//        verify(notificationUserRepository, times(1)).save(any());
//    }
//
//    @Test
//    void deleteNotificationForCustomer_UserNotFound_ShouldReturnBadRequest() {
//        String username = "nonExistentUser";
//        int notificationId = 1;
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.deleteNotificationForCustomer(notificationId, username);
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//        assertEquals("User not found", responseEntity.getBody());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, never()).findById(any());
//        verify(notificationUserRepository, never()).save(any());
//    }
//
//    @Test
//    void deleteNotificationForCustomer_NotificationUserNotFound_ShouldReturnNotFound() {
//        String username = recipientUser1.getUsername();
//        int notificationId = 1;
//        NotificationUserId notificationUserIdKey = new NotificationUserId(notificationId, recipientUser1.getUserId());
//
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(recipientUser1));
//        when(notificationUserRepository.findById(notificationUserIdKey)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.deleteNotificationForCustomer(notificationId, username);
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertEquals("Notification not found for this user", responseEntity.getBody());
//
//        verify(userRepository, times(1)).findByUserUsername(username);
//        verify(notificationUserRepository, times(1)).findById(notificationUserIdKey);
//        verify(notificationUserRepository, never()).save(any());
//    }
//
//
//    @Test
//    void getNotificationRecipients_NotificationExists_ShouldReturnListOfUsernames() {
//        int notificationId = notifications.get(0).getId();
//        NotificationUser notificationUser1 = createNotificationUser(notificationId, recipientUser1.getUserId(), false, false);
//        NotificationUser notificationUser2 = createNotificationUser(notificationId, recipientUser2.getUserId(), false, false);
//        List<NotificationUser> notificationUsers = Arrays.asList(notificationUser1, notificationUser2);
//
//        when(notificationUserRepository.findByNotificationId(notificationId)).thenReturn(notificationUsers);
//        when(userRepository.findById(recipientUser1.getUserId())).thenReturn(Optional.of(recipientUser1));
//        when(userRepository.findById(recipientUser2.getUserId())).thenReturn(Optional.of(recipientUser2));
//
//        List<String> recipients = notificationService.getNotificationRecipients(notificationId);
//
//        assertNotNull(recipients);
//        assertEquals(2, recipients.size());
//        assertTrue(recipients.contains(recipientUser1.getUsername()));
//        assertTrue(recipients.contains(recipientUser2.getUsername()));
//
//        verify(notificationUserRepository, times(1)).findByNotificationId(notificationId);
//        verify(userRepository, times(2)).findById(anyString());
//    }
//
//    @Test
//    void getNotificationRecipients_NoRecipients_ShouldReturnEmptyList() {
//        int notificationId = 1;
//        when(notificationUserRepository.findByNotificationId(notificationId)).thenReturn(Collections.emptyList());
//
//        List<String> recipients = notificationService.getNotificationRecipients(notificationId);
//
//        assertNotNull(recipients);
//        assertTrue(recipients.isEmpty());
//
//        verify(notificationUserRepository, times(1)).findByNotificationId(notificationId);
//        verify(userRepository, never()).findById(anyString());
//    }
//
//    @Test
//    void getNotificationById_NotificationExists_ShouldReturnNotificationResponseEntity() {
//        int notificationId = notifications.get(0).getId();
//        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notifications.get(0)));
//
//        ResponseEntity<?> responseEntity = notificationService.getNotificationById(notificationId);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(responseEntity.getBody());
//        assertEquals(notifications.get(0), responseEntity.getBody());
//
//        verify(notificationRepository, times(1)).findById(notificationId);
//    }
//
//    @Test
//    void getNotificationById_NotificationNotFound_ShouldReturnNotFoundResponseEntity() {
//        int notificationId = 100;
//        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.getNotificationById(notificationId);
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseEntity.getBody());
//
//        verify(notificationRepository, times(1)).findById(notificationId);
//    }
//
//
//    @Test
//    void addNotification_ValidNotificationDTO_ShouldAddNotificationAndRecipients() {
//        NotificationDTO notificationDTO = createNotificationDTO("New Notification", "New Content", senderUser.getUsername(), Arrays.asList(recipientUser1.getUsername(), recipientUser2.getUsername()), false);
//
//        when(userRepository.findByUserUsername(senderUser.getUsername())).thenReturn(Optional.of(senderUser));
//        when(userRepository.findByUserUsername(recipientUser1.getUsername())).thenReturn(Optional.of(recipientUser1));
//        when(userRepository.findByUserUsername(recipientUser2.getUsername())).thenReturn(Optional.of(recipientUser2));
//        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
//            Notification notification = invocation.getArgument(0);
//            notification.setId(3); // Simulate ID generation
//            return notification;
//        });
//        when(notificationUserRepository.save(any(NotificationUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//
//        ResponseEntity<?> responseEntity = notificationService.addNotification(notificationDTO);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//
//        verify(userRepository, times(1)).findByUserUsername(senderUser.getUsername());
//        verify(userRepository, times(3)).findByUserUsername(anyString()); // Recipient users
//        verify(notificationRepository, times(1)).save(any(Notification.class));
//        verify(notificationUserRepository, times(2)).save(any(NotificationUser.class));
//    }
//
//    @Test
//    void addNotification_SenderUserNotFound_ShouldReturnBadRequest() {
//        NotificationDTO notificationDTO = createNotificationDTO("New Notification", "New Content", "nonExistentSender", Collections.emptyList(), false);
//        when(userRepository.findByUserUsername("nonExistentSender")).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.addNotification(notificationDTO);
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//        Map<String, String> responseBody = (Map<String, String>) responseEntity.getBody();
//        assertNotNull(responseBody);
//        assertEquals("User sender 'nonExistentSender' not found", responseBody.get("message"));
//
//
//        verify(userRepository, times(1)).findByUserUsername("nonExistentSender");
//        verify(userRepository, never()).findByUserUsername(recipientUser1.getUsername());
//        verify(notificationRepository, never()).save(any(Notification.class));
//        verify(notificationUserRepository, never()).save(any(NotificationUser.class));
//    }
//
//    @Test
//    void addNotification_RecipientUserNotFound_ShouldReturnBadRequestWithErrors() {
//        NotificationDTO notificationDTO = createNotificationDTO("New Notification", "New Content", senderUser.getUsername(), Collections.singletonList("nonExistentRecipient"), false);
//
//        when(userRepository.findByUserUsername(senderUser.getUsername())).thenReturn(Optional.of(senderUser));
//        when(userRepository.findByUserUsername("nonExistentRecipient")).thenReturn(Optional.empty());
//        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
//            Notification notification = invocation.getArgument(0);
//            notification.setId(3); // Simulate ID generation
//            return notification;
//        });
//
//
//        ResponseEntity<?> responseEntity = notificationService.addNotification(notificationDTO);
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//        Map<String, Object> responseBody = (Map<String, Object>) responseEntity.getBody();
//        assertNotNull(responseBody);
//        assertEquals("Some recipients not found", responseBody.get("message"));
//        List<String> errors = (List<String>) responseBody.get("errors");
//        assertTrue(errors.contains("Recipient user 'nonExistentRecipient' not found"));
//
//
//        verify(userRepository, times(1)).findByUserUsername(senderUser.getUsername());
//        verify(userRepository, times(1)).findByUserUsername("nonExistentRecipient");
//        verify(notificationRepository, times(1)).save(any(Notification.class));
//        verify(notificationUserRepository, never()).save(any(NotificationUser.class));
//    }
//
//
//    @Test
//    void deleteNotification_ValidId_ShouldDeleteNotificationAndRelatedNotificationUsers() {
//        int notificationId = notifications.get(0).getId();
//        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notifications.get(0)));
//        doNothing().when(notificationUserRepository).deleteByNotificationId(notificationId);
//        doNothing().when(notificationRepository).deleteById(notificationId);
//
//        ResponseEntity<?> responseEntity = notificationService.deleteNotification(notificationId);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//
//        verify(notificationRepository, times(1)).findById(notificationId);
//        verify(notificationUserRepository, times(1)).deleteByNotificationId(notificationId);
//        verify(notificationRepository, times(1)).deleteById(notificationId);
//    }
//
//    @Test
//    void deleteNotification_InvalidId_ShouldReturnBadRequest() {
//        int notificationId = -1;
//
//        ResponseEntity<?> responseEntity = notificationService.deleteNotification(notificationId);
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//
//        verify(notificationRepository, never()).findById(anyInt());
//        verify(notificationRepository, never()).deleteById(anyInt());
//    }
//
//    @Test
//    void deleteNotification_NotificationNotFound_ShouldReturnNotFound() {
//        int notificationId = 100;
//        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.deleteNotification(notificationId);
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//
//        verify(notificationRepository, times(1)).findById(notificationId);
//        verify(notificationUserRepository, never()).deleteByNotificationId(anyInt());
//        verify(notificationRepository, never()).deleteById(anyInt());
//    }
//
//
//    @Test
//    void updateNotification_NotificationExists_ShouldUpdateNotification() {
//        Notification existingNotification = notifications.get(0);
//        Notification updatedNotification = createNotification(existingNotification.getId(), "Updated Title", "Updated Content", senderUser, false, OffsetDateTime.now());
//
//        when(notificationRepository.findById(existingNotification.getId())).thenReturn(Optional.of(existingNotification));
//        when(notificationRepository.save(any(Notification.class))).thenReturn(updatedNotification);
//
//        ResponseEntity<?> responseEntity = notificationService.updateNotification(updatedNotification);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//
//
//        assertEquals("Updated Title", existingNotification.getNotificationTitle()); // Verify updated in existing object
//        assertEquals("Updated Content", existingNotification.getNotificationContent());
//    }
//
//    @Test
//    void updateNotification_NotificationNotFound_ShouldReturnNotFound() {
//        Notification updatedNotification = createNotification(100, "Updated Title", "Updated Content", senderUser, false, OffsetDateTime.now());
//        when(notificationRepository.findById(100)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = notificationService.updateNotification(updatedNotification);
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//
//        verify(notificationRepository, times(1)).findById(100);
//        verify(notificationRepository, never()).save(any(Notification.class));
//    }
//
//
//    // Helper methods to create mock entities
//    private Notification createNotification(Integer id, String title, String content, User sender, Boolean isDraft, OffsetDateTime createdAt) {
//        Notification notification = new Notification();
//        notification.setId(id);
//        notification.setNotificationTitle(title);
//        notification.setNotificationContent(content);
//        notification.setUserIdSender(sender);
//        notification.setIsNotificationDraft(isDraft);
//        notification.setNotificationCreatedAt(createdAt);
//        return notification;
//    }
//
//    private User createUser(String userId, String username, Role role) {
//        User user = new User();
//        user.setUserId(userId);
//        user.setUserUsername(username);
//        user.setRole(role);
//        user.setIsUserEnabled(true);
//        return user;
//    }
//
//    private Role createRole(Integer roleId, String roleName) {
//        Role role = new Role();
//        role.setId(roleId);
//        role.setRoleName(roleName);
//        return role;
//    }
//
//    private NotificationUser createNotificationUser(Integer notificationId, String userId, boolean isViewed, boolean isDeleted) {
//        NotificationUser notificationUser = new NotificationUser();
//        notificationUser.setId(new NotificationUserId(notificationId, userId));
//        notificationUser.setIsNotificationViewed(isViewed);
//        notificationUser.setIsNotificationDeleted(isDeleted);
//        return notificationUser;
//    }
//
//    private NotificationDTO createNotificationDTO(String title, String content, String senderUsername, List<String> recipientUsernames, Boolean isDraft) {
//        NotificationDTO dto = new NotificationDTO();
//        dto.setNotificationTitle(title);
//        dto.setNotificationContent(content);
//        dto.setUserName(senderUsername);
//        dto.setUserNames(recipientUsernames);
//        dto.setNotificationDraft(isDraft);
//        return dto;
//    }
//}