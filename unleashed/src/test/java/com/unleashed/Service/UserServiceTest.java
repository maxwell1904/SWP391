//package com.unleashed.Service;
//
//import com.unleashed.dto.*;
//import com.unleashed.dto.mapper.UserMapper;
//import com.unleashed.dto.mapper.ViewUserMapper;
//import com.unleashed.entity.Role;
//import com.unleashed.entity.User;
//import com.unleashed.entity.UserRank;
//import com.unleashed.exception.CustomException;
//import com.unleashed.repo.UserRepository;
//import com.unleashed.repo.UserRoleRepository;
//import com.unleashed.service.EmailService;
//import com.unleashed.service.RankService;
//import com.unleashed.service.UserRoleService;
//import com.unleashed.service.UserService;
//import com.unleashed.util.JwtUtil;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.data.domain.*;
//import org.springframework.http.HttpStatus;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//import java.time.ZoneId;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//public class UserServiceTest {
//
//    @Autowired
//    @InjectMocks
//    private UserService userService;
//
//    @MockBean
//    private UserRepository userRepository;
//
//    @MockBean
//    private UserRoleRepository userRoleRepository;
//
//    @MockBean
//    private JwtUtil jwtUtil;
//
//    @MockBean
//    private AuthenticationManager authenticationManager;
//
//    @MockBean
//    private UserMapper userMapper;
//
//    @MockBean
//    private UserRoleService userRoleService;
//
//    @MockBean
//    private EmailService emailService;
//
//    @MockBean
//    private ViewUserMapper viewUserMapper;
//
//    @MockBean
//    private RankService rankService;
//
//    private List<User> users;
//    private Role userRole;
//    private Role adminRole;
//    private Role staffRole;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        userRole = createUserRole(2, "ROLE_USER");
//        adminRole = createUserRole(1, "ROLE_ADMIN");
//        staffRole = createUserRole(3, "ROLE_STAFF");
//
//        users = Arrays.asList(
//                createUser("user1", userRole, true, null, "user1", "password", "User One", "user1@example.com", "123-456-7891", null, "Address 1", "image1.jpg", null),
//                createUser("user2", userRole, false, null, "user2", "password", "User Two", "user2@example.com", "987-654-3211", null, "Address 2", "image2.jpg", null),
//                createUser("admin1", adminRole, true, null, "admin1", "password", "Admin One", "admin1@example.com", "111-222-3331", null, "Admin Address", "admin1.jpg", null),
//                createUser("staff1", staffRole, true, null, "staff1", "password", "Staff One", "staff1@example.com", "444-555-6661", null, "Staff Address", "staff1.jpg", null)
//        );
//    }
//
//    // Helper methods to create mock entities
//    private User createUser(String userId, Role role, Boolean isEnabled, String googleId, String username, String password, String fullName, String email, String phone, String birthdate, String address, String image, String paymentMethod) {
//        User user = new User();
//        user.setUserId(userId);
//        user.setRole(role);
//        user.setIsUserEnabled(isEnabled);
//        user.setUserGoogleId(googleId);
//        user.setUserUsername(username);
//        user.setUserPassword(password);
//        user.setUserFullname(fullName);
//        user.setUserEmail(email);
//        user.setUserPhone(phone);
//        user.setUserBirthdate(birthdate);
//        user.setUserAddress(address);
//        user.setUserImage(image);
//        user.setUserCurrentPaymentMethod(paymentMethod);
//        user.setUserCreatedAt(OffsetDateTime.now(ZoneId.systemDefault()));
//        user.setUserUpdatedAt(OffsetDateTime.now(ZoneId.systemDefault()));
//        return user;
//    }
//    private Role createUserRole(Integer id, String name) {
//        Role role = new Role();
//        role.setId(id);
//        role.setRoleName(name);
//        return role;
//    }
//
//
//    @Test
//    void updatePassword_ValidInput_ShouldReturnSuccessResponse() {
//        ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
//        changePasswordDTO.setUserEmail("user1@example.com");
//        changePasswordDTO.setOldPassword("password");
//        changePasswordDTO.setNewPassword("newPassword");
//
//        User existingUser = users.get(0);
//        existingUser.setUserPassword(new BCryptPasswordEncoder().encode("password")); // Encode the password for matching
//
//        when(userRepository.findByUserEmail("user1@example.com")).thenReturn(Optional.of(existingUser));
//        when(userRepository.save(any(User.class))).thenReturn(existingUser);
//
//        ResponseDTO responseDTO = userService.updatePassword(changePasswordDTO);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.OK.value(), responseDTO.getStatusCode());
//        assertEquals("Password updated successfully!", responseDTO.getMessage());
//        verify(userRepository, times(1)).findByUserEmail("user1@example.com");
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void login_ValidCredentials_ShouldReturnSuccessResponseWithToken() {
//        UserDTO userDTO = new UserDTO();
//        userDTO.setUsername("user1");
//        userDTO.setPassword("password");
//
//        User existingUser = users.get(0);
//        existingUser.setUserPassword(new BCryptPasswordEncoder().encode("password")); // Encode password for comparison
//
//        when(userRepository.findByUserUsername("user1")).thenReturn(Optional.of(existingUser));
//        when(authenticationManager.authenticate(any())).thenReturn(null); // Mock successful authentication
//        when(jwtUtil.generateUserToken(existingUser)).thenReturn("mockToken");
//        when(rankService.hasRegistered(existingUser)).thenReturn(false);
//
//        ResponseDTO responseDTO = userService.login(userDTO);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.OK.value(), responseDTO.getStatusCode());
//        assertEquals("Successful", responseDTO.getMessage());
//        assertEquals("mockToken", responseDTO.getToken());
//        assertEquals("1 Day", responseDTO.getExpirationTime());
//        verify(userRepository, times(1)).findByUserUsername("user1");
//        verify(authenticationManager, times(1)).authenticate(any());
//        verify(jwtUtil, times(1)).generateUserToken(existingUser);
//    }
//
//    @Test
//    void login_BadCredentials_ShouldReturnUnauthorizedResponse() {
//        UserDTO userDTO = new UserDTO();
//        userDTO.setUsername("user1");
//        userDTO.setPassword("wrongPassword");
//
//        User existingUser = users.get(0);
//        existingUser.setUserPassword(new BCryptPasswordEncoder().encode("password"));
//
//        when(userRepository.findByUserUsername("user1")).thenReturn(Optional.of(existingUser));
//        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));
//
//        ResponseDTO responseDTO = userService.login(userDTO);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.UNAUTHORIZED.value(), responseDTO.getStatusCode());
//        assertEquals("Username or password is wrong! Please try again", responseDTO.getMessage());
//        verify(userRepository, times(1)).findByUserUsername("user1");
//        verify(authenticationManager, times(1)).authenticate(any());
//        verify(jwtUtil, never()).generateUserToken(any());
//    }
//
//    @Test
//    void login_GenericException_ShouldReturnInternalServerErrorResponse() {
//        UserDTO userDTO = new UserDTO();
//        userDTO.setUsername("user1");
//        userDTO.setPassword("password");
//
//        when(userRepository.findByUserUsername("user1")).thenReturn(Optional.of(users.get(0)));
//        when(authenticationManager.authenticate(any())).thenThrow(new RuntimeException("Unexpected error"));
//
//        ResponseDTO responseDTO = userService.login(userDTO);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), responseDTO.getStatusCode());
//        assertTrue(responseDTO.getMessage().startsWith("An unexpected error occurred during login:"));
//        verify(userRepository, times(1)).findByUserUsername("user1");
//        verify(authenticationManager, times(1)).authenticate(any());
//        verify(jwtUtil, never()).generateUserToken(any());
//    }
//
//    @Test
//    void findByGoogleId_ExistingGoogleId_ShouldReturnUser() {
//        when(userRepository.findByUserGoogleId("googleId123")).thenReturn(Optional.of(users.get(0)));
//
//        User result = userService.findByGoogleId("googleId123");
//
//        assertNotNull(result);
//        assertEquals("user1", result.getUserUsername());
//        verify(userRepository, times(1)).findByUserGoogleId("googleId123");
//    }
//
//    @Test
//    void findByGoogleId_NonExistingGoogleId_ShouldReturnNull() {
//        when(userRepository.findByUserGoogleId("nonExistingGoogleId")).thenReturn(Optional.empty());
//
//        User result = userService.findByGoogleId("nonExistingGoogleId");
//
//        assertNull(result);
//        verify(userRepository, times(1)).findByUserGoogleId("nonExistingGoogleId");
//    }
//
//    @Test
//    void create_ValidUser_ShouldReturnCreatedUser() {
//        User userToCreate = createUser(null, userRole, true, null, "newUser", "password", "New User", "newuser@example.com", "123-123-1235", null, "New Address", "newuser.jpg", null);
//        User savedUser = createUser("userId123", userRole, true, null, "newUser", "encodedPassword", "New User", "newuser@example.com", "123-123-1235", null, "New Address", "newuser.jpg", null); // Simulate saved user with ID and encoded password
//        when(userRepository.save(any(User.class))).thenReturn(savedUser);
//
//        User createdUser = userService.create(userToCreate);
//
//        assertNotNull(createdUser);
//        assertEquals("userId123", createdUser.getUserId());
//        assertEquals("newUser", createdUser.getUserUsername());
//        assertNotEquals("password", createdUser.getUserPassword()); // Password should be encoded
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void handleGoogleLogin_NewUser_ShouldCreateUserAndReturnSuccessResponse() {
//        String googleId = "googleIdNewUser";
//        String email = "newgoogleuser@example.com";
//        String fullName = "New Google User";
//        String userImage = "google_image.jpg";
//
//        when(userRepository.findByUserGoogleId(googleId)).thenReturn(Optional.empty());
//        when(userRoleService.findById(2)).thenReturn(userRole); // Mock user role
//        when(userRepository.save(any(User.class))).thenReturn(users.get(0)); // Mock user save
//        when(authenticationManager.authenticate(any())).thenReturn(null);
//        when(jwtUtil.generateUserToken(any())).thenReturn("mockToken");
//        when(userRepository.findByUserUsername(email)).thenReturn(Optional.of(users.get(0)));
//        when(rankService.hasRegistered(any())).thenReturn(false);
//
//
//        ResponseDTO responseDTO = userService.handleGoogleLogin(googleId, email, fullName, userImage);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.OK.value(), responseDTO.getStatusCode());
//        assertEquals("Successful", responseDTO.getMessage());
//        assertEquals("mockToken", responseDTO.getToken());
//        assertEquals("1 Day", responseDTO.getExpirationTime());
//        verify(userRepository, times(1)).findByUserGoogleId(googleId);
//        verify(userRoleService, times(1)).findById(2);
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(authenticationManager, times(1)).authenticate(any());
//        verify(jwtUtil, times(1)).generateUserToken(any());
//    }
//
//    @Test
//    void handleGoogleLogin_ExistingUser_ShouldLoginUserAndReturnSuccessResponse() {
//        String googleId = "googleIdExistingUser";
//        String email = "existinggoogleuser@example.com";
//        String fullName = "Existing Google User";
//        String userImage = "google_image.jpg";
//
//        when(userRepository.findByUserGoogleId(googleId)).thenReturn(Optional.of(users.get(0))); // Existing user found
//        when(authenticationManager.authenticate(any())).thenReturn(null);
//        when(jwtUtil.generateUserToken(any())).thenReturn("mockToken");
//        when(userRepository.findByUserUsername(email)).thenReturn(Optional.of(users.get(0)));
//        when(rankService.hasRegistered(any())).thenReturn(false);
//
//
//        ResponseDTO responseDTO = userService.handleGoogleLogin(googleId, email, fullName, userImage);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.OK.value(), responseDTO.getStatusCode());
//        assertEquals("Successful", responseDTO.getMessage());
//        assertEquals("mockToken", responseDTO.getToken());
//        assertEquals("1 Day", responseDTO.getExpirationTime());
//        verify(userRepository, times(1)).findByUserGoogleId(googleId);
//        verify(userRoleService, never()).findById(anyInt()); // Role service not called for existing user
//        verify(userRepository, never()).save(any(User.class)); // No save for existing user
//        verify(authenticationManager, times(1)).authenticate(any());
//        verify(jwtUtil, times(1)).generateUserToken(any());
//    }
//
//    @Test
//    void handleGoogleLogin_AuthenticationFails_ShouldReturnInternalServerErrorResponse() {
//        String googleId = "googleIdNewUserFailAuth";
//        String email = "newgoogleuserfailauth@example.com";
//        String fullName = "New Google User Fail Auth";
//        String userImage = "google_image.jpg";
//
//        when(userRepository.findByUserGoogleId(googleId)).thenReturn(Optional.empty());
//        when(userRoleService.findById(2)).thenReturn(userRole);
//        when(userRepository.save(any(User.class))).thenReturn(users.get(0));
//        when(authenticationManager.authenticate(any())).thenThrow(new RuntimeException("Authentication failed"));
//
//        ResponseDTO responseDTO = userService.handleGoogleLogin(googleId, email, fullName, userImage);
//
//        assertNotNull(responseDTO);
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), responseDTO.getStatusCode());
//        assertTrue(responseDTO.getMessage().startsWith("Error During  "));
//        verify(userRepository, times(1)).findByUserGoogleId(googleId);
//        verify(userRoleService, times(1)).findById(2);
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(authenticationManager, times(1)).authenticate(any());
//        verify(jwtUtil, never()).generateUserToken(any());
//    }
//
//
//    @Test
//    void findByEmail_ExistingEmail_ShouldReturnUser() {
//        when(userRepository.findByUserEmail("user1@example.com")).thenReturn(Optional.of(users.get(0)));
//
//        User result = userService.findByEmail("user1@example.com");
//
//        assertNotNull(result);
//        assertEquals("user1", result.getUserUsername());
//        verify(userRepository, times(1)).findByUserEmail("user1@example.com");
//    }
//
//    @Test
//    void findByEmail_NonExistingEmail_ShouldReturnNull() {
//        when(userRepository.findByUserEmail("nonexistent@example.com")).thenReturn(Optional.empty());
//
//        User result = userService.findByEmail("nonexistent@example.com");
//
//        assertNull(result);
//        verify(userRepository, times(1)).findByUserEmail("nonexistent@example.com");
//    }
//
//    @Test
//    void existsByUsername_ExistingUsername_ShouldReturnTrue() {
//        when(userRepository.existsByUserUsername("user1")).thenReturn(true);
//
//        boolean result = userService.existsByUsername("user1");
//
//        assertTrue(result);
//        verify(userRepository, times(1)).existsByUserUsername("user1");
//    }
//
//    @Test
//    void existsByUsername_NonExistingUsername_ShouldReturnFalse() {
//        when(userRepository.existsByUserUsername("nonexistentUser")).thenReturn(false);
//
//        boolean result = userService.existsByUsername("nonexistentUser");
//
//        assertFalse(result);
//        verify(userRepository, times(1)).existsByUserUsername("nonexistentUser");
//    }
//
//    @Test
//    void existsByEmail_ExistingEmail_ShouldReturnTrue() {
//        when(userRepository.existsByUserEmail("user1@example.com")).thenReturn(true);
//
//        boolean result = userService.existsByEmail("user1@example.com");
//
//        assertTrue(result);
//        verify(userRepository, times(1)).existsByUserEmail("user1@example.com");
//    }
//
//    @Test
//    void existsByEmail_NonExistingEmail_ShouldReturnFalse() {
//        when(userRepository.existsByUserEmail("nonexistent@example.com")).thenReturn(false);
//
//        boolean result = userService.existsByEmail("nonexistent@example.com");
//
//        assertFalse(result);
//        verify(userRepository, times(1)).existsByUserEmail("nonexistent@example.com");
//    }
//
//    @Test
//    void findById_ExistingId_ShouldReturnUser() {
//        when(userRepository.findById("user1")).thenReturn(Optional.of(users.get(0)));
//
//        User result = userService.findById("user1");
//
//        assertNotNull(result);
//        assertEquals("user1", result.getUserId());
//        verify(userRepository, times(1)).findById("user1");
//    }
//
//    @Test
//    void findById_NonExistingId_ShouldReturnNull() {
//        when(userRepository.findById("nonexistentId")).thenReturn(Optional.empty());
//
//        User result = userService.findById("nonexistentId");
//
//        assertNull(result);
//        verify(userRepository, times(1)).findById("nonexistentId");
//    }
//
//    @Test
//    void updatePassword_UserAndPassword_ShouldReturnUpdatedUser() {
//        User userToUpdatePassword = users.get(0);
//        String newPassword = "newEncodedPassword";
//        User updatedUser = createUser("user1", userRole, true, null, "user1", newPassword, "User One", "user1@example.com", "123-456-7891", null, "Address 1", "image1.jpg", null); // Simulate saved user with encoded password
//
//        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
//
//        User result = userService.updatePassword(userToUpdatePassword, "newPassword");
//
//        assertNotNull(result);
//        assertEquals(userToUpdatePassword.getUserId(), result.getUserId());
//        assertNotEquals("password", result.getUserPassword()); // Password should be encoded
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void updateEnable_UserAndEnableStatus_ShouldReturnUpdatedUser() {
//        User userToUpdateEnable = users.get(0);
//        boolean enableStatus = false;
//        User updatedUser = createUser("user1", userRole, enableStatus, null, "user1", "password", "User One", "user1@example.com", "123-456-7891", null, "Address 1", "image1.jpg", null);
//
//        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
//
//        User result = userService.updateEnable(userToUpdateEnable, enableStatus);
//
//        assertNotNull(result);
//        assertEquals(userToUpdateEnable.getUserId(), result.getUserId());
//        assertEquals(enableStatus, result.getIsUserEnabled());
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void updateUserInfo_ExistingUser_ShouldReturnUpdatedUser() {
//        String userId = "user1";
//        UpdateUserDTO updatedUserInfo = new UpdateUserDTO();
//        updatedUserInfo.setFullName("Updated Name");
//        updatedUserInfo.setUserImage("updated_image.jpg");
//        updatedUserInfo.setUserPhone("999-999-9999");
//        updatedUserInfo.setUserAddress("Updated Address");
//
//        User existingUser = users.get(0);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
//        when(userRepository.save(any(User.class))).thenReturn(existingUser);
//
//        User result = userService.updateUserInfo(userId, updatedUserInfo);
//
//        assertNotNull(result);
//        assertEquals(userId, result.getUserId());
//        assertEquals("Updated Name", result.getUserFullname());
//        assertEquals("updated_image.jpg", result.getUserImage());
//        assertEquals("999-999-9999", result.getUserPhone());
//        assertEquals("Updated Address", result.getUserAddress());
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void updateUserInfo_NonExistingUser_ShouldReturnNull() {
//        String userId = "nonexistentId";
//        UpdateUserDTO updatedUserInfo = new UpdateUserDTO();
//
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        User result = userService.updateUserInfo(userId, updatedUserInfo);
//
//        assertNull(result);
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void findAll_UsersExist_ShouldReturnUserList() {
//        when(userRepository.findAll()).thenReturn(users);
//
//        List<User> result = userService.findAll();
//
//        assertNotNull(result);
//        assertEquals(4, result.size());
//        verify(userRepository, times(1)).findAll();
//    }
//
//    @Test
//    void findAll_NoUsersExist_ShouldReturnEmptyList() {
//        when(userRepository.findAll()).thenReturn(Collections.emptyList());
//
//        List<User> result = userService.findAll();
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(userRepository, times(1)).findAll();
//    }
//
//    @Test
//    void findByUsername_ExistingUsername_ShouldReturnUser() {
//        when(userRepository.findByUserUsername("user1")).thenReturn(Optional.of(users.get(0)));
//
//        User result = userService.findByUsername("user1");
//
//        assertNotNull(result);
//        assertEquals("user1", result.getUserUsername());
//        verify(userRepository, times(1)).findByUserUsername("user1");
//    }
//
//    @Test
//    void findByUsername_NonExistingUsername_ShouldReturnNull() {
//        when(userRepository.findByUserUsername("nonexistentUser")).thenReturn(Optional.empty());
//
//        User result = userService.findByUsername("nonexistentUser");
//
//        assertNull(result);
//        verify(userRepository, times(1)).findByUserUsername("nonexistentUser");
//    }
//
//    @Test
//    void getAllUsers_UsersExist_ShouldReturnViewInfoDTOList() {
//        when(userRepository.findAll()).thenReturn(users);
//
//        List<ViewInfoDTO> result = userService.getAllUsers();
//
//        assertNotNull(result);
//        assertEquals(4, result.size());
//        verify(userRepository, times(1)).findAll();
//    }
//
//    @Test
//    void getAllUsers_NoUsersExist_ShouldReturnEmptyViewInfoDTOList() {
//        when(userRepository.findAll()).thenReturn(Collections.emptyList());
//
//        List<ViewInfoDTO> result = userService.getAllUsers();
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(userRepository, times(1)).findAll();
//    }
//
//    @Test
//    void updateUserDetails_ExistingUser_ShouldUpdateAndNotThrowException() throws CustomException {
//        String userId = "user1";
//        AdminUpdateDTO adminUpdateDTO = new AdminUpdateDTO();
//        adminUpdateDTO.setEnable(false);
//
//        User existingUser = users.get(0);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
//        when(userRoleService.findById(1)).thenReturn(adminRole);
//        when(userRepository.save(any(User.class))).thenReturn(existingUser);
//
//        assertDoesNotThrow(() -> userService.updateUserDetails(userId, adminUpdateDTO));
//
//        assertEquals(false, existingUser.getIsUserEnabled());
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRoleService, times(1)).findById(1);
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void updateUserDetails_NonExistingUser_ShouldThrowCustomExceptionNotFound() {
//        String userId = "nonexistentId";
//        AdminUpdateDTO adminUpdateDTO = new AdminUpdateDTO();
//
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.updateUserDetails(userId, adminUpdateDTO));
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), exception.getStatusCode());
//        assertEquals("User not found", exception.getMessage());
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRoleService, never()).findById(anyInt());
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void updateUserDetails_AdminUser_ShouldThrowCustomExceptionForbidden() {
//        String userId = "admin1";
//        AdminUpdateDTO adminUpdateDTO = new AdminUpdateDTO();
//
//        User existingAdminUser = users.get(2); // Admin user
//        when(userRepository.findById(userId)).thenReturn(Optional.of(existingAdminUser));
//        when(userRoleService.findById(1)).thenReturn(adminRole);
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.updateUserDetails(userId, adminUpdateDTO));
//
//        assertEquals(HttpStatus.FORBIDDEN.value(), exception.getStatusCode());
//        assertEquals("User is admin", exception.getMessage());
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRoleService, times(1)).findById(1);
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void getAllUser_UsersExistWithSearch_ShouldReturnPageImplUser() {
//        int page = 0;
//        int size = 10;
//        String search = "user1";
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userCreatedAt"));
//        Page<User> userPage = new PageImpl<>(Collections.singletonList(users.get(0)), pageable, 1);
//
//        when(userRoleRepository.findAll()).thenReturn(Collections.singletonList(userRole));
//        when(userRepository.findByRolesAndSearch(anyList(), eq(search), eq(pageable))).thenReturn(userPage);
//
//        PageImpl<User> result = userService.getAllUser(page, size, search);
//
//        assertNotNull(result);
//        assertEquals(1, result.getContent().size());
//        assertEquals("user1", result.getContent().get(0).getUserUsername());
//        verify(userRoleRepository, times(1)).findAll();
//        verify(userRepository, times(1)).findByRolesAndSearch(anyList(), eq(search), eq(pageable));
//    }
//
//    @Test
//    void getAllUser_UsersExistNoSearch_ShouldReturnPageImplUser() {
//        int page = 0;
//        int size = 10;
//        String search = null;
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userCreatedAt"));
//        Page<User> userPage = new PageImpl<>(users, pageable, users.size());
//
//        when(userRepository.findAll(pageable)).thenReturn(userPage);
//
//        PageImpl<User> result = userService.getAllUser(page, size, search);
//
//        assertNotNull(result);
//        assertEquals(users.size(), result.getContent().size());
//        verify(userRepository, times(1)).findAll(pageable);
//        verify(userRepository, never()).findByRolesAndSearch(anyList(), anyString(), any());
//    }
//
//    @Test
//    void getAllUser_NoUsersExist_ShouldReturnEmptyPageImplUser() {
//        int page = 0;
//        int size = 10;
//        String search = null;
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userCreatedAt"));
//        Page<User> emptyUserPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
//
//        when(userRepository.findAll(pageable)).thenReturn(emptyUserPage);
//
//        PageImpl<User> result = userService.getAllUser(page, size, search);
//
//        assertNotNull(result);
//        assertTrue(result.getContent().isEmpty());
//        assertEquals(0, result.getTotalElements());
//        verify(userRepository, times(1)).findAll(pageable);
//        verify(userRepository, never()).findByRolesAndSearch(anyList(), anyString(), any());
//    }
//
//    @Test
//    void deleteUserById_ExistingUser_ShouldDeleteUserAndReturnTrue() throws CustomException {
//        String userId = "user1";
//        when(userRepository.existsById(userId)).thenReturn(true);
//        doNothing().when(userRepository).deleteById(userId);
//
//        boolean result = userService.deleteUserById(userId);
//
//        assertTrue(result);
//        verify(userRepository, times(1)).existsById(userId);
//        verify(userRepository, times(1)).deleteById(userId);
//    }
//
//    @Test
//    void deleteUserById_NonExistingUser_ShouldThrowCustomExceptionNotFound() {
//        String userId = "nonexistentId";
//        when(userRepository.existsById(userId)).thenReturn(false);
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.deleteUserById(userId));
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), exception.getStatusCode());
//        assertEquals("User not found", exception.getMessage());
//        verify(userRepository, times(1)).existsById(userId);
//        verify(userRepository, never()).deleteById(anyString());
//    }
//
//    @Test
//    void createUser_ValidUser_ShouldReturnCreatedUser_createUserMethod() {
//        User userToCreate = createUser(null, userRole, true, null, "newUser", "password", "New User", "newuser@example.com", "123-123-1235", null, "New Address", "newuser.jpg", null);
//        User savedUser = createUser("userId123", userRole, true, null, "newUser", "password", "New User", "newuser@example.com", "123-123-1235", null, "New Address", "newuser.jpg", null); // Simulate saved user with ID
//        when(userRepository.save(any(User.class))).thenReturn(savedUser);
//
//        User createdUser = userService.createUser(userToCreate);
//
//        assertNotNull(createdUser);
//        assertEquals("userId123", createdUser.getUserId());
//        assertEquals("newUser", createdUser.getUserUsername());
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void createStaffAccount_ValidStaffAccount_ShouldReturnCreatedUser() throws CustomException {
//        User staffToCreate = createUser(null, staffRole, true, null, "newStaff", "password", "New Staff", "newstaff@example.com", "123-123-1236", null, "New Staff Address", "newstaff.jpg", null);
//        User savedStaff = createUser("staffId123", staffRole, true, null, "newStaff", "encodedPassword", "New Staff", "newstaff@example.com", "123-123-1236", null, "New Staff Address", "newstaff.jpg", null); // Simulate saved staff with ID and encoded password
//
//        when(userRepository.existsByUserEmail("newstaff@example.com")).thenReturn(false);
//        when(userRoleService.findById(3)).thenReturn(staffRole);
//        when(userRepository.save(any(User.class))).thenReturn(savedStaff);
//
//        User createdStaff = userService.createStaffAccount(staffToCreate);
//
//        assertNotNull(createdStaff);
//        assertEquals("staffId123", createdStaff.getUserId());
//        assertEquals("newStaff", createdStaff.getUserUsername());
//        assertNotEquals("password", createdStaff.getUserPassword()); // Password should be encoded
//        assertEquals(staffRole, createdStaff.getRole());
//        assertTrue(createdStaff.getIsUserEnabled());
//        verify(userRepository, times(1)).existsByUserEmail("newstaff@example.com");
//        verify(userRoleService, times(1)).findById(3);
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void createStaffAccount_ExistingEmail_ShouldThrowCustomExceptionBadRequest() {
//        User staffToCreate = createUser(null, staffRole, true, null, "newStaff", "password", "New Staff", "existing@example.com", "123-123-1236", null, "New Staff Address", "newstaff.jpg", null);
//
//        when(userRepository.existsByUserEmail("existing@example.com")).thenReturn(true);
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.createStaffAccount(staffToCreate));
//
//        assertEquals(HttpStatus.BAD_REQUEST.value(), exception.getStatusCode());
//        assertEquals("Email already exists!", exception.getMessage());
//        verify(userRepository, times(1)).existsByUserEmail("existing@example.com");
//        verify(userRoleService, never()).findById(anyInt());
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void getUserById_ExistingUserId_ShouldReturnUser() throws CustomException {
//        String userId = "user1";
//        when(userRepository.findById(userId)).thenReturn(Optional.of(users.get(0)));
//
//        User result = userService.getUserById(userId);
//
//        assertNotNull(result);
//        assertEquals(userId, result.getUserId());
//        verify(userRepository, times(1)).findById(userId);
//    }
//
//    @Test
//    void getUserById_NonExistingUserId_ShouldThrowCustomExceptionNotFound() {
//        String userId = "nonexistentId";
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.getUserById(userId));
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), exception.getStatusCode());
//        assertEquals("User not found", exception.getMessage());
//        verify(userRepository, times(1)).findById(userId);
//    }
//
//    @Test
//    void getUserInfoByUsername_ExistingUsername_ShouldReturnViewInfoDTO() {
//        String username = "user1";
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.of(users.get(0)));
//
//        ViewInfoDTO result = userService.getUserInfoByUsername(username);
//
//        assertNotNull(result);
//        assertEquals(username, result.getUsername());
//        verify(userRepository, times(1)).findByUserUsername(username);
//    }
//
//    @Test
//    void getUserInfoByUsername_NonExistingUsername_ShouldReturnNull() {
//        String username = "nonexistentUser";
//        when(userRepository.findByUserUsername(username)).thenReturn(Optional.empty());
//
//        ViewInfoDTO result = userService.getUserInfoByUsername(username);
//
//        assertNull(result);
//        verify(userRepository, times(1)).findByUserUsername(username);
//    }
//
//    @Test
//    void getUserInfoById_ExistingUserId_ShouldReturnViewInfoDTO() {
//        String userId = "user1";
//        when(userRepository.findById(userId)).thenReturn(Optional.of(users.get(0)));
//
//        ViewInfoDTO result = userService.getUserInfoById(userId);
//
//        assertNotNull(result);
//        assertEquals(userId, result.getUserId());
//        verify(userRepository, times(1)).findById(userId);
//    }
//
//    @Test
//    void getUserInfoById_NonExistingUserId_ShouldReturnNull() {
//        String userId = "nonexistentId";
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        ViewInfoDTO result = userService.getUserInfoById(userId);
//
//        assertNull(result);
//        verify(userRepository, times(1)).findById(userId);
//    }
//
//    @Test
//    void getCurrentUser_NonExistingUserId_ShouldThrowCustomExceptionNotFound() {
//        String userId = "nonexistentId";
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.getCurrentUser(userId));
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), exception.getStatusCode());
//        assertEquals("User not found", exception.getMessage());
//        verify(userRepository, times(1)).findById(userId);
//    }
//
//    @Test
//    void updateUserProfile_MissingUserId_ShouldThrowCustomExceptionBadRequest() {
//        Map<String, Object> updatedUserInfoMap = new HashMap<>();
//        updatedUserInfoMap.put("email", "updated@example.com");
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.updateUserProfile(updatedUserInfoMap));
//
//        assertEquals(HttpStatus.BAD_REQUEST.value(), exception.getStatusCode());
//        assertEquals("User ID is missing in request!", exception.getMessage());
//        verify(userRepository, never()).findById(anyString());
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void updateUserProfile_NonExistingUser_ShouldThrowCustomExceptionNotFound() {
//        String userId = "nonexistentId";
//        Map<String, Object> updatedUserInfoMap = new HashMap<>();
//        updatedUserInfoMap.put("userId", userId);
//
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        CustomException exception = assertThrows(CustomException.class, () -> userService.updateUserProfile(updatedUserInfoMap));
//
//        assertEquals(HttpStatus.NOT_FOUND.value(), exception.getStatusCode());
//        assertEquals("User not found", exception.getMessage());
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void disableAccount_ExistingUser_ShouldDisableAccountAndReturnTrue() {
//        String userId = "user1";
//        User existingUser = users.get(0);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
//        when(userRepository.save(any(User.class))).thenReturn(existingUser);
//
//        boolean result = userService.disableAccount(userId);
//
//        assertTrue(result);
//        assertFalse(existingUser.getIsUserEnabled()); // Account should be disabled
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRepository, times(1)).save(any(User.class));
//    }
//
//    @Test
//    void disableAccount_NonExistingUser_ShouldReturnFalse() {
//        String userId = "nonexistentId";
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        boolean result = userService.disableAccount(userId);
//
//        assertFalse(result);
//        verify(userRepository, times(1)).findById(userId);
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void logout_ValidToken_ShouldRevokeToken() {
//        String token = "testToken123";
//        doNothing().when(jwtUtil).revokeToken(token);
//
//        userService.logout(token);
//
//        verify(jwtUtil, times(1)).revokeToken(token);
//    }
//}