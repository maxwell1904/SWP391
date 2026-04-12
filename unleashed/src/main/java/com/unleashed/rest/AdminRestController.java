package com.unleashed.rest;

import com.unleashed.dto.AdminUpdateDTO;
import com.unleashed.dto.ViewInfoDTO;
import com.unleashed.entity.User;
import com.unleashed.exception.CustomException;
import com.unleashed.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {
    private final UserService userService;

    @Autowired
    public AdminRestController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            userService.createStaffAccount(user);
            return ResponseEntity.ok("Account staff created successfully!");
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
        } catch (Exception e) {
            //System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("An error occurred while creating a staff account.");
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping
    public ResponseEntity<Page<User>> getAllUser(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<User> users = userService.getAllUser(page, size, search);
        return ResponseEntity.ok(users);
    }


    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }


    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUserById(userId);
            return ResponseEntity.ok("User has been deleted successfully.");
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
        }
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/users/search")
    public ResponseEntity<List<ViewInfoDTO>> getAllUsers() {
        List<ViewInfoDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody AdminUpdateDTO adminUpdateDTO) {
        try {
            userService.updateUserDetails(userId, adminUpdateDTO);
            return ResponseEntity.ok("User has been updated successfully.");
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
        }
    }

}
