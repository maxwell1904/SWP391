package com.unleashed.service;

import com.unleashed.dto.UserDTO;
import com.unleashed.dto.UserPageDTO;
import com.unleashed.entity.User;
import com.unleashed.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;

    @Autowired
    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public UserPageDTO searchUsers(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        String excludedUsername = "System-chan";

        Page<User> userPage = userRepository.searchByTermExcludingUsername(searchTerm, excludedUsername, pageable);

        List<UserDTO> userDTOs = userPage.getContent().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());

        return new UserPageDTO(userDTOs, userPage.getTotalPages());
    }


    private UserDTO convertToUserDTO(User user) {
        return new UserDTO(
                user.getUserId().toString(),
                user.getUserUsername(),
                null, // Không trả về password vì bảo mật
                user.getUserEmail(),
                user.getUserFullname(),
                user.getUserImage(),
                user.getUserPhone(),
                user.getIsUserEnabled(),
                user.getRole(),
                user.getUserCurrentPaymentMethod(),
                user.getUserAddress(),
                user.getUserCreatedAt(),
                user.getUserUpdatedAt()
        );
    }
}
