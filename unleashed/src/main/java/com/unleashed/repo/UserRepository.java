package com.unleashed.repo;

import com.unleashed.entity.Role;
import com.unleashed.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUserEmail(String userEmail);

    Optional<User> findByUserUsername(String username);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(TRIM(u.userUsername)) = LOWER(TRIM(:identifier)) " +
            "OR LOWER(TRIM(u.userEmail)) = LOWER(TRIM(:identifier))")
    Optional<User> findByUsernameOrEmailInsensitive(@Param("identifier") String identifier);

    Optional<User> findByUserUsernameAndUserPassword(String userUsername, String userPassword);

    Optional<User> findByUserGoogleId(String googleId);

    boolean existsByUserUsername(String username);

    boolean existsByUserEmail(String username);

    Optional<User> findById(UUID userId);

    /**
     * Searches for users by username or email, explicitly excluding a specific username.
     * This is the recommended approach for this kind of complex condition.
     *
     * @param searchTerm The term to search for in username and email.
     * @param excludedUsername The username to exclude from the results.
     * @param pageable Pagination information.
     * @return A page of matching users.
     */
    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.userUsername) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND u.userUsername <> :excludedUsername " +
            "ORDER BY " +
            "  CASE u.role.roleName " +
            "    WHEN 'ADMIN' THEN 1 " +
            "    WHEN 'STAFF' THEN 2 " +
            "    WHEN 'USER' THEN 3 " +
            "    ELSE 4 " +
            "  END ASC, u.userUsername ASC")
    Page<User> searchByTermExcludingUsername(@Param("searchTerm") String searchTerm,
                                             @Param("excludedUsername") String excludedUsername,
                                             Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role.roleName IN :roles " +
            "AND (:search IS NULL OR LOWER(u.userUsername) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findByRolesAndSearch(
            @Param("roles") List<Role> roles,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role IN :roles")
    Page<User> findByRolesOnly(@Param("roles") List<Role> roles, Pageable pageable);

    boolean existsByUserPhone(String userPhone);

    @Query("SELECT u FROM User u WHERE u.role.id = 2 AND " +
            "u.userUsername <> 'System-chan' AND (" +
            "LOWER(u.userUsername) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.userFullname) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> searchByTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

}