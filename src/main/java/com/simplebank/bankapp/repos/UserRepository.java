package com.simplebank.bankapp.repos;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.simplebank.bankapp.models.User;

public interface UserRepository extends MongoRepository<User, String> {

    boolean existsByEmail(String email);
}
