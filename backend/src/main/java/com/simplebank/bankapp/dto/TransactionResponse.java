package com.simplebank.bankapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.simplebank.bankapp.models.Transaction;

public class TransactionResponse {

    private String txnId;
    private String type;
    private BigDecimal amount;
    private LocalDateTime date;

    public static TransactionResponse from(Transaction txn) {
        TransactionResponse response = new TransactionResponse();
        response.txnId = txn.getId();
        response.type = txn.getTxnType();
        response.amount = txn.getAmount();
        response.date = txn.getCreatedAt();
        return response;
    }

    public String getTxnId() {
        return txnId;
    }

    public void setTxnId(String txnId) {
        this.txnId = txnId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
