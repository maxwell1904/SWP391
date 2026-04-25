package com.unleashed.repo;

import com.unleashed.entity.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherStatusRespository extends JpaRepository<VoucherStatus, Integer> {
    VoucherStatus getVoucherStatusById(Integer id);

    VoucherStatus findByVoucherStatusName(String voucherStatusName);
}
