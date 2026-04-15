package com.unleashed.dto.mapper;

import com.unleashed.dto.StockDTO;
import com.unleashed.entity.Stock;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface StockMapper {

    StockMapper INSTANCE = Mappers.getMapper(StockMapper.class);

    StockDTO toDTO(Stock stock);

    Stock toEntity(StockDTO stockDTO);
}
