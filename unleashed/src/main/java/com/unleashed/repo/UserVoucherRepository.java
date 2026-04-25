package com.unleashed.repo;

import com.unleashed.entity.UserVoucher;
import com.unleashed.entity.composite.UserVoucherId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, UserVoucherId> {

    boolean existsById_UserIdAndId_VoucherId(UUID userId, Integer voucherId);

    List<UserVoucher> findAllById_VoucherId(int voucherId);

    List<UserVoucher> findAllById_UserId(UUID userId);

    Optional<UserVoucher> findById_UserIdAndId_VoucherId(UUID userId, Integer voucherId);

    @Query("SELECT COUNT(ud) FROM UserVoucher ud WHERE ud.id.userId = :userId AND ud.id.voucherId = :voucherId")
    int countByUserIdAndVoucherId(@Param("userId") UUID userId, @Param("voucherId") Integer voucherId);

    @Query("SELECT COUNT(ud) FROM UserVoucher ud WHERE ud.id.voucherId = :voucherId")
    int countByVoucherId(@Param("voucherId") Integer voucherId);

    @Query("SELECT ud.id.voucherId FROM UserVoucher ud WHERE ud.id.userId = :userId")
    List<Integer> findVoucherIdsByUserId(@Param("userId") UUID userId);

}