//package com.unleashed.Service;
//
//import com.unleashed.entity.Category;
//import com.unleashed.dto.CategoryDTO;
//import com.unleashed.repo.CategoryRepository;
//import com.unleashed.repo.ProductRepository;
//import com.unleashed.service.CategoryService;
//import lombok.extern.slf4j.Slf4j;
//import org.aspectj.lang.annotation.Before;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.dao.DataIntegrityViolationException;
//
//import java.sql.Timestamp;
//import java.time.Instant;
//import java.time.OffsetDateTime;
//import java.time.ZoneOffset;
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.mockito.Mockito.times;
//import static org.mockito.Mockito.when;
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class CategoryServiceTest {
//    @Autowired
//    private CategoryService categoryService;
//
//    @MockBean
//    private CategoryRepository categoryRepository;
//
//    @MockBean
//    private ProductRepository productRepository;
//
//    List<Category> categories;
//
//    @BeforeEach
//    void setup() {
//        Category category1 = new Category();
//        category1.setId(1);
//        category1.setCategoryName("Category 1");
//        category1.setCategoryDescription("Category Description 1");
//        category1.setCategoryImageUrl("123.pdf");
//        category1.setCategoryUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
//        category1.setCategoryCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
//        Category category2 = new Category();
//        category2.setId(2);
//        category2.setCategoryName("Category 2");
//        category2.setCategoryDescription("Category Description 2");
//        category2.setCategoryImageUrl("456.pdf");
//        category2.setCategoryUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
//        category2.setCategoryCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
//        categories = Arrays.asList(category1,category2);
//
//        when(categoryRepository.findAll()).thenReturn(categories);
//    }
//
//    @Test
//    void getAllCategoriesWithQuantity_ShouldReturnCategoryDTOList() {
//        Object[] result1 = {categories.get(0).getId(), categories.get(0).getCategoryName(), categories.get(0).getCategoryDescription(), categories.get(0).getCategoryImageUrl(), Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), 10L};
//        Object[] result2 = {categories.get(1).getId(), categories.get(1).getCategoryName(), categories.get(1).getCategoryDescription(), categories.get(1).getCategoryImageUrl(), Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), 5L};
//        List<Object[]> mockResults = Arrays.asList(result1, result2);
//
//        when(categoryRepository.findAllCategoriesWithQuantity()).thenReturn(mockResults);
//
//        List<CategoryDTO> categoryDTOs = categoryService.getAllCategoriesWithQuantity();
//
//        assertNotNull(categoryDTOs);
//        assertEquals(2, categoryDTOs.size());
//        assertEquals(categories.get(0).getId(), categoryDTOs.get(0).getId());
//        assertEquals(categories.get(0).getCategoryName(), categoryDTOs.get(0).getCategoryName());
//        assertEquals(10L, categoryDTOs.get(0).getTotalQuantity());
//        assertEquals(categories.get(1).getId(), categoryDTOs.get(1).getId());
//        assertEquals(categories.get(1).getCategoryName(), categoryDTOs.get(1).getCategoryName());
//        assertEquals(5L, categoryDTOs.get(1).getTotalQuantity());
//    }
//
//    @Test
//    void findById_ExistingId_ShouldReturnCategory() {
//        when(categoryRepository.findById(1)).thenReturn(Optional.of(categories.get(0)));
//
//        Category category = categoryService.findById(1);
//
//        assertNotNull(category);
//        assertEquals("Category 1", category.getCategoryName());
//        verify(categoryRepository, times(1)).findById(1);
//    }
//
//    @Test
//    void findById_NonExistingId_ShouldReturnNull() {
//        when(categoryRepository.findById(100)).thenReturn(Optional.empty());
//
//        Category category = categoryService.findById(100);
//
//        assertNull(category);
//        verify(categoryRepository, times(1)).findById(100);
//    }
//
//    @Test
//    void deleteCategory_ExistingIdNoProducts_ShouldReturnTrue() {
//        when(categoryRepository.existsById(1)).thenReturn(true);
//        when(productRepository.existsByCategories_Id(1)).thenReturn(false);
//        doNothing().when(categoryRepository).deleteById(1);
//
//        boolean deleted = categoryService.deleteCategory(1);
//
//        assertTrue(deleted);
//        verify(categoryRepository, times(1)).existsById(1);
//        verify(productRepository, times(1)).existsByCategories_Id(1);
//        verify(categoryRepository, times(1)).deleteById(1);
//    }
//
//    @Test
//    void deleteCategory_NonExistingId_ShouldReturnFalse() {
//        when(categoryRepository.existsById(100)).thenReturn(false);
//
//        boolean deleted = categoryService.deleteCategory(100);
//
//        assertFalse(deleted);
//        verify(categoryRepository, times(1)).existsById(100);
//        verify(productRepository, never()).existsByCategories_Id(anyInt());
//        verify(categoryRepository, never()).deleteById(anyInt());
//    }
//
//    @Test
//    void deleteCategory_ExistingIdWithProducts_ShouldThrowException() {
//        when(categoryRepository.existsById(1)).thenReturn(true);
//        when(productRepository.existsByCategories_Id(1)).thenReturn(true);
//
//        assertThrows(DataIntegrityViolationException.class, () -> categoryService.deleteCategory(1));
//
//        verify(categoryRepository, times(1)).existsById(1);
//        verify(productRepository, times(1)).existsByCategories_Id(1);
//        verify(categoryRepository, never()).deleteById(anyInt());
//    }
//
//    @Test
//    void createCategory_NewCategory_ShouldReturnCreatedCategory() {
//        Category newCategory = new Category();
//        newCategory.setCategoryName("New Category");
//        newCategory.setCategoryDescription("New Description");
//        newCategory.setCategoryImageUrl("new.pdf");
//
//        when(categoryRepository.existsByCategoryName("New Category")).thenReturn(false);
//        when(categoryRepository.save(newCategory)).thenReturn(newCategory);
//
//        Category createdCategory = categoryService.createCategory(newCategory);
//
//        assertNotNull(createdCategory);
//        assertEquals("New Category", createdCategory.getCategoryName());
//        verify(categoryRepository, times(1)).existsByCategoryName("New Category");
//        verify(categoryRepository, times(1)).save(newCategory);
//    }
//
//    @Test
//    void createCategory_ExistingCategoryName_ShouldThrowException() {
//        Category existingCategory = categories.get(0);
//        when(categoryRepository.existsByCategoryName("Category 1")).thenReturn(true);
//
//        assertThrows(RuntimeException.class, () -> categoryService.createCategory(existingCategory));
//
//        verify(categoryRepository, times(1)).existsByCategoryName("Category 1");
//        verify(categoryRepository, never()).save(any());
//    }
//
//    @Test
//    void updateCategory_ExistingCategory_ShouldReturnUpdatedCategory() {
//        Category updatedCategory = new Category();
//        updatedCategory.setId(1);
//        updatedCategory.setCategoryName("Updated Category Name");
//        updatedCategory.setCategoryDescription("Updated Description");
//        updatedCategory.setCategoryImageUrl("updated.pdf");
//
//        Category existingCategory = categories.get(0);
//        when(categoryRepository.findById(1)).thenReturn(Optional.of(existingCategory));
//        when(categoryRepository.existsByCategoryName("Updated Category Name")).thenReturn(false);
//        when(categoryRepository.save(any(Category.class))).thenReturn(updatedCategory);
//
//        Category resultCategory = categoryService.updateCategory(updatedCategory);
//
//        assertNotNull(resultCategory);
//        assertEquals("Updated Category Name", resultCategory.getCategoryName());
//        assertEquals("Updated Description", resultCategory.getCategoryDescription());
//        assertEquals("updated.pdf", resultCategory.getCategoryImageUrl());
//        verify(categoryRepository, times(1)).findById(1);
//        verify(categoryRepository, times(1)).existsByCategoryName("Updated Category Name");
//        verify(categoryRepository, times(1)).save(any(Category.class));
//    }
//
//    @Test
//    void updateCategory_NonExistingCategory_ShouldThrowException() {
//        Category updatedCategory = new Category();
//        updatedCategory.setId(100);
//        updatedCategory.setCategoryName("Updated Category Name");
//        updatedCategory.setCategoryDescription("Updated Description");
//        updatedCategory.setCategoryImageUrl("updated.pdf");
//
//        when(categoryRepository.findById(100)).thenReturn(Optional.empty());
//
//        assertThrows(RuntimeException.class, () -> categoryService.updateCategory(updatedCategory));
//
//        verify(categoryRepository, times(1)).findById(100);
//        verify(categoryRepository, never()).existsByCategoryName(anyString());
//        verify(categoryRepository, never()).save(any());
//    }
//
//    @Test
//    void updateCategory_ExistingCategoryNameConflict_ShouldThrowException() {
//        Category updatedCategory = new Category();
//        updatedCategory.setId(1);
//        updatedCategory.setCategoryName("Category 2"); // Tên trùng với category2
//        updatedCategory.setCategoryDescription("Updated Description");
//        updatedCategory.setCategoryImageUrl("updated.pdf");
//
//        Category existingCategory = categories.get(0);
//        when(categoryRepository.findById(1)).thenReturn(Optional.of(existingCategory));
//        when(categoryRepository.existsByCategoryName("Category 2")).thenReturn(true);
//
//        assertThrows(RuntimeException.class, () -> categoryService.updateCategory(updatedCategory));
//
//        verify(categoryRepository, times(1)).findById(1);
//        verify(categoryRepository, times(1)).existsByCategoryName("Category 2");
//        verify(categoryRepository, never()).save(any());
//    }
//
//    @Test
//    void updateCategory_SameCategoryName_ShouldUpdateSuccessfully() {
//        Category updatedCategory = new Category();
//        updatedCategory.setId(1);
//        updatedCategory.setCategoryName("Category 1"); // Same name as existing
//        updatedCategory.setCategoryDescription("Updated Description");
//        updatedCategory.setCategoryImageUrl("updated.pdf");
//
//        Category existingCategory = categories.get(0);
//        when(categoryRepository.findById(1)).thenReturn(Optional.of(existingCategory));
//        when(categoryRepository.existsByCategoryName("Category 1")).thenReturn(false); // Should return false as name is same and check is for *new* name
//        when(categoryRepository.save(any(Category.class))).thenReturn(updatedCategory);
//
//        Category resultCategory = categoryService.updateCategory(updatedCategory);
//
//        assertNotNull(resultCategory);
//        assertEquals("Category 1", resultCategory.getCategoryName()); // Still "Category 1" as we are testing same name update.
//        assertEquals("Updated Description", resultCategory.getCategoryDescription());
//        assertEquals("updated.pdf", resultCategory.getCategoryImageUrl());
//        verify(categoryRepository, times(1)).findById(1);
//        verify(categoryRepository, times(1)).existsByCategoryName("Category 1");
//        verify(categoryRepository, times(1)).save(any(Category.class));
//    }
//
//    @Test
//    void toOffsetDateTime_TimestampInput_ReturnsOffsetDateTime() {
//        // Khoi tao
//        Timestamp timestamp = Timestamp.from(Instant.now());
//
//        // Gan du lieu
//        OffsetDateTime result = categoryService.toOffsetDateTime(timestamp);
//
//        // Kiem tra
//        assertNotNull(result);
//        assertEquals(ZoneOffset.UTC, result.getOffset());
//    }
//
//    @Test
//    void toOffsetDateTime_InstantInput_ReturnsOffsetDateTime() {
//        // Khoi tao
//        Instant instant = Instant.now();
//
//        // Gan du lieu
//        OffsetDateTime result = categoryService.toOffsetDateTime(instant);
//
//        // Kiem tra
//        assertNotNull(result);
//        assertEquals(ZoneOffset.UTC, result.getOffset());
//    }
//
//    @Test
//    void toOffsetDateTime_OffsetDateTimeInput_ReturnsSameOffsetDateTime() {
//        // Khoi tao
//        OffsetDateTime offsetDateTime = OffsetDateTime.now().withOffsetSameInstant(ZoneOffset.ofHours(7));
//
//        // Gan du lieu
//        OffsetDateTime result = categoryService.toOffsetDateTime(offsetDateTime);
//
//        // Kiem tra
//        assertNotNull(result);
//        assertEquals(ZoneOffset.ofHours(7), result.getOffset());
//        assertEquals(offsetDateTime, result);
//    }
//
//    @Test
//    void toOffsetDateTime_NullInput_ReturnsNull() {
//        // Khoi tao
//        Object nullInput = null;
//
//        // Gan du lieu
//        OffsetDateTime result = categoryService.toOffsetDateTime(nullInput);
//
//        // Kiem tra
//        assertNull(result);
//    }
//}
