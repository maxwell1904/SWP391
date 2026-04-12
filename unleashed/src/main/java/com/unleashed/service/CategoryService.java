package com.unleashed.service;

import com.unleashed.dto.CategoryDTO;
import com.unleashed.entity.Category;
import com.unleashed.repo.CategoryRepository;
import com.unleashed.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategoriesWithQuantity() {
        return categoryRepository.findAllCategoriesWithQuantity().stream()
                .map(result -> new CategoryDTO(
                        ((Number) result[0]).intValue(),
                        (String) result[1],
                        (String) result[2],
                        (String) result[3],
                        toOffsetDateTime(result[4]),
                        toOffsetDateTime(result[5]),
                        ((Number) result[6]).longValue()
                ))
                .toList();
    }

    private OffsetDateTime toOffsetDateTime(Object timeObject) {
        if (timeObject instanceof Timestamp) {
            return ((Timestamp) timeObject).toInstant().atOffset(ZoneOffset.UTC);
        } else if (timeObject instanceof Instant) {
            return ((Instant) timeObject).atOffset(ZoneOffset.UTC);
        } else if (timeObject instanceof OffsetDateTime) {
            return (OffsetDateTime) timeObject;
        }
        return null;
    }

    public Category findById(int id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Transactional
    public boolean deleteCategory(int id) {
        if (!categoryRepository.existsById(id)) {
            return false;
        }
        boolean hasProducts = productRepository.existsByCategories_Id(id);
        if (hasProducts) {
            throw new DataIntegrityViolationException("Cannot delete category because it has linked products.");
        }
        categoryRepository.deleteById(id);
        return true;
    }

    @Transactional
    public Category createCategory(Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("Category name cannot be null or empty");
        }
        if (category.getCategoryDescription() == null || category.getCategoryDescription().trim().isEmpty()) {
            throw new RuntimeException("Category description cannot be null or empty");
        }
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new RuntimeException("Category already exists with name: " + category.getCategoryName());
        }
        if (category.getCategoryImageUrl() == null || category.getCategoryImageUrl().trim().isEmpty()) {
            throw new RuntimeException("Category image cannot be empty");
        }
        return categoryRepository.save(category);
    }


    @Transactional
    public Category updateCategory(Category updatedCategory) {
        return categoryRepository.findById(updatedCategory.getId())
                .map(existingCategory -> {
                    if (categoryRepository.existsByCategoryName(updatedCategory.getCategoryName()) &&
                            !existingCategory.getCategoryName().equals(updatedCategory.getCategoryName())) {
                        throw new RuntimeException("Category already exists with name: " + updatedCategory.getCategoryName());
                    }
                    if (updatedCategory.getCategoryName() == null || updatedCategory.getCategoryName().trim().isEmpty()) {
                        throw new RuntimeException("Category name cannot be empty");
                    }
                    if (updatedCategory.getCategoryDescription() == null || updatedCategory.getCategoryDescription().trim().isEmpty()) {
                        throw new RuntimeException("Category description cannot empty");
                    }
                    if (updatedCategory.getCategoryImageUrl() == null || updatedCategory.getCategoryImageUrl().trim().isEmpty()) {
                        throw new RuntimeException("Category image cannot empty");
                    }
                    existingCategory.setCategoryName(updatedCategory.getCategoryName());
                    existingCategory.setCategoryDescription(updatedCategory.getCategoryDescription());
                    existingCategory.setCategoryImageUrl(updatedCategory.getCategoryImageUrl());
                    existingCategory.setCategoryUpdatedAt(java.time.OffsetDateTime.now());
                    return categoryRepository.save(existingCategory);
                })
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + updatedCategory.getId()));
    }


}
