package com.unleashed.dto.mapper;

import com.unleashed.dto.ProductDTO;
import com.unleashed.dto.ProductListDTO;
import com.unleashed.entity.Category;
import com.unleashed.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);

    //    @Mapping(source = "productCategories", target = "categoryIdList", qualifiedByName = "extractCategoryIds")
    @Mapping(source = "brand.id", target = "brandId")
    @Mapping(target = "categoryList", expression = "java(product.getCategories())")
    ProductListDTO toProductListDTO(Product product);

    @Named("extractCategoryIds")
    default List<Integer> extractCategoryIds(List<Category> productCategories) { // Or Set, or array
        if (productCategories == null) {
            return Collections.emptyList(); // Or handle null as needed
        }
        return productCategories.stream()
                .map(Category::getId)
                .collect(Collectors.toList());
    }

    ProductDTO toDTO(Product product);

    Product toEntity(ProductDTO productDTO);


}
