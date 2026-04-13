package com.unleashed.rest;

import com.unleashed.dto.UserDTO;
import com.unleashed.dto.UserPageDTO;
import com.unleashed.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    @GetMapping("/searchUsers")
    public ResponseEntity<UserPageDTO> searchUsers(
            @RequestParam(defaultValue = "") String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserPageDTO userPage = adminService.searchUsers(searchTerm, page, size);
        return ResponseEntity.ok(userPage);
    }
}
