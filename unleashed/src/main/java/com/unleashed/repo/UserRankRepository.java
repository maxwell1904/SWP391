package com.unleashed.repo;

import com.unleashed.entity.UserRank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRankRepository extends JpaRepository<UserRank, UUID> {

    @Query("SELECT ur FROM UserRank ur" +
            " WHERE LOWER(ur.user.userUsername) LIKE LOWER(CONCAT('%', :search, '%')) ")
    Page<UserRank> findBySearch(
            @Param("search") String search,
            Pageable pageable);
}