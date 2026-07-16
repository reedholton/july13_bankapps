package com.simplebank.bankapp.repos;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.simplebank.bankapp.models.Account;

public interface AccountRepository extends MongoRepository<Account, String> {

    List<Account> findByUserId(String userId);
}
