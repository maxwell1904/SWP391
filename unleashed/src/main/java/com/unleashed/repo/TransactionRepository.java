package com.unleashed.repo;

import com.unleashed.dto.SimplifiedTransactionCardDTO;
import com.unleashed.entity.Provider;
import com.unleashed.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer>, JpaSpecificationExecutor<Transaction> {

    List<Transaction> findByIdInOrderByIdDesc(List<Integer> ids);

    boolean existsByProvider(Provider provider);

    List<Transaction> findByStockId(Integer stockId);
}