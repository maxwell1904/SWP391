package com.unleashed.repo;

import com.unleashed.entity.Voucher;
import com.unleashed.entity.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer>, JpaSpecificationExecutor<Voucher> {


    Optional<Voucher> findByVoucherCode(String voucherCode);


    // Optional<Voucher> findByCode(String code);

//    Page<Voucher> findAllByVoucherStatus(VoucherStatus status, Pageable pageable);
//
//    @Query("SELECT d FROM Voucher d WHERE " +
//            "(:status IS NULL OR d.voucherStatus = :status) AND " +
//            "(:type IS NULL OR d.voucherType = :type) AND " +
//            "(:minOrderValue IS NULL OR d.voucherMinimumOrderValue <= :minOrderValue)")
//    List<Voucher> filterVouchers(@Param("status") VoucherStatus status,
//                                   @Param("type") VoucherType type,
//                                   @Param("minOrderValue") Double minOrderValue,
//                                   Pageable pageable);
//
//    @Query("SELECT d, ud.isVoucherUsed FROM Voucher d " +
//            "LEFT JOIN UserVoucher ud ON d.id = ud.id.voucherId " +
//            "WHERE ud.id.userId = :userId")
//    List<Object[]> findVouchersWithUsageCountByUserId(@Param("userId") String userId);

    /**
     * Finds INACTIVE vouchers that are within their valid date range and have not reached their usage limit.
     * These are candidates to be activated.
     */
    List<Voucher> findByVoucherStatusAndVoucherStartDateBeforeAndVoucherEndDateAfter(
            VoucherStatus inactiveStatus, OffsetDateTime nowForStart, OffsetDateTime nowForEnd);

    /**
     * Finds ACTIVE vouchers that have reached their usage limit.
     * These should be made INACTIVE.
     */
    List<Voucher> findByVoucherStatusAndVoucherUsageCountGreaterThanEqual(
            VoucherStatus activeStatus, Integer usageLimit);


    /**
     * Finds vouchers (regardless of current status) whose end date has passed
     * but are not yet marked as EXPIRED.
     */
    List<Voucher> findAllByVoucherEndDateBeforeAndVoucherStatusNot(
            OffsetDateTime now, VoucherStatus expiredStatus);

    /**
     * Finds all Voucher entities that are associated with the given VoucherStatus.
     * Spring Data JPA automatically implements this method based on its name.
     * "findBy" - The query prefix.
     * "VoucherStatus" - The property name in the Voucher entity.
     *
     * @param voucherStatus The VoucherStatus entity to search for.
     * @return A list of vouchers matching the given status.
     */
    List<Voucher> findByVoucherStatus(VoucherStatus voucherStatus);

}