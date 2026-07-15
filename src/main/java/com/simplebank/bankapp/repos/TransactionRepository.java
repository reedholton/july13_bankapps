package com.simplebank.bankapp.repos;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.simplebank.bankapp.models.Transaction;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByAccountIdOrderByCreatedAtDesc(String accountId);
}
