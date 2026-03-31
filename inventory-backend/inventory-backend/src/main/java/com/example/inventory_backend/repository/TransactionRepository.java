package com.example.inventory_backend.repository;

import com.example.inventory_backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.timestamp >= :startDate ORDER BY t.timestamp ASC")
    List<Transaction> findTransactionsAfter(@Param("startDate") LocalDateTime startDate);
}
