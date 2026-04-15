package com.unleashed.service;

import com.unleashed.entity.Role;
import com.unleashed.repo.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserRoleService {
    private final UserRoleRepository userRoleRepository;

    @Autowired
    public UserRoleService(UserRoleRepository userRoleRepository) {
        this.userRoleRepository = userRoleRepository;
    }

    public List<Role> findAll() {
        return userRoleRepository.findAll();
    }

    public Role findById(int id) {
        return userRoleRepository.findById(id).orElse(null);
    }

    @Transactional
    public Role createUserRole(Role Role) {
        return userRoleRepository.save(Role);
    }

    @Transactional
    public Role updateUserRole(Integer id, Role updatedUserRole) {
        Optional<Role> existingUserRole = userRoleRepository.findById(id);

        if (existingUserRole.isPresent()) {
            Role role = existingUserRole.get();
            role.setRoleName(updatedUserRole.getRoleName());
            return userRoleRepository.save(role);
        } else {
            return null;
        }
    }

    @Transactional
    public void deleteUserRole(Integer id) {
        userRoleRepository.deleteById(id);
    }
}
