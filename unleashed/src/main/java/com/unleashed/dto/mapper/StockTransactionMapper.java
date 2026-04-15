package com.unleashed.dto.mapper;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StockTransactionMapper {

//    StockTransactionMapper INSTANCE = Mappers.getMapper(StockTransactionMapper.class);
//
//    @Mapping(source = "transactionType", target = "transactionType")
//    StockTransactionDTO toDTO(Transaction stockTransaction);
//
//    @Mapping(source = "transactionType", target = "transactionType")
//    Transaction toEntity(StockTransactionDTO stockTransactionDTO);
}