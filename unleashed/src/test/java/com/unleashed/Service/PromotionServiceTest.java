//package com.unleashed.Service;
//
//import com.unleashed.dto.ResponseDTO;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.PromotionProductId;
//import com.unleashed.repo.ProductRepository;
//import com.unleashed.repo.PromotionProductRepository;
//import com.unleashed.repo.PromotionRepository;
//import com.unleashed.repo.PromotionStatusRepository;
//import com.unleashed.service.PromotionService;
//import jakarta.persistence.EntityNotFoundException;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class PromotionServiceTest {
//
//    @Autowired
//    private PromotionService promotionService;
//
//    @MockBean
//    private PromotionRepository promotionRepository;
//
//    @MockBean
//    private ProductRepository productRepository;
//
//    @MockBean
//    private PromotionProductRepository promotionProductRepository;
//
//    @MockBean
//    private PromotionStatusRepository promotionStatusRepository;
//
//    private List<Promotion> promotions;
//    private PromotionStatus activeStatus;
//    private PromotionStatus inactiveStatus;
//    private PromotionStatus expiredStatus;
//    private PromotionType promotionType;
//    private Product product1;
//    private Product product2;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        promotionType = createPromotionType(1, "Percentage");
//        activeStatus = createPromotionStatus(2, "Active");
//        inactiveStatus = createPromotionStatus(1, "Inactive");
//        expiredStatus = createPromotionStatus(3, "Expired");
//
//        product1 = createProduct("P001", "Product 1", "Description 1", BigDecimal.valueOf(10.00), "Category 1");
//        product2 = createProduct("P002", "Product 2", "Description 2", BigDecimal.valueOf(20.00), "Category 2");
//
//
//        promotions = Arrays.asList(
//                createPromotion(1, promotionType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusWeeks(1)),
//                createPromotion(2, promotionType, inactiveStatus, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1))
//        );
//    }
//
//    @Test
//    void findAll_ShouldReturnAllPromotionsAndUpdateStatus() {
//        when(promotionRepository.findAllByOrderByIdDesc()).thenReturn(promotions);
//        when(promotionStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(promotionStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(promotionRepository.saveAll(anyList())).thenReturn(promotions);
//
//        List<Promotion> result = promotionService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(expiredStatus, result.get(1).getPromotionStatus()); // Second promotion should be expired
//        verify(promotionRepository, times(1)).findAllByOrderByIdDesc();
//        verify(promotionRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void createPromotion_ShouldReturnCreatedPromotion() {
//        Promotion promotionToCreate = createPromotion(null, promotionType, activeStatus, BigDecimal.valueOf(0.15), OffsetDateTime.now(), OffsetDateTime.now().plusDays(7));
//        Promotion savedPromotion = createPromotion(3, promotionType, activeStatus, BigDecimal.valueOf(0.15), OffsetDateTime.now(), OffsetDateTime.now().plusDays(7)); // Simulate saved promotion with ID
//        when(promotionRepository.save(any(Promotion.class))).thenReturn(savedPromotion);
//
//        Promotion createdPromotion = promotionService.createPromotion(promotionToCreate);
//
//        assertNotNull(createdPromotion);
//        assertEquals(savedPromotion.getId(), createdPromotion.getId());
//        assertEquals(promotionToCreate.getPromotionValue(), createdPromotion.getPromotionValue());
//        verify(promotionRepository, times(1)).save(any(Promotion.class));
//    }
//
//    @Test
//    void updatePromotion_ExistingPromotion_ShouldReturnUpdatedPromotionResponseEntity() {
//        Integer promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        Promotion promotionUpdateData = createPromotion(promotionId, promotionType, expiredStatus, BigDecimal.valueOf(0.25), OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusWeeks(2));
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(promotionRepository.save(any(Promotion.class))).thenReturn(promotionUpdateData);
//
//        ResponseEntity<?> responseEntity = promotionService.updatePromotion(promotionId, promotionUpdateData);
//        Promotion updatedPromotion = (Promotion) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(updatedPromotion);
//        assertEquals(promotionUpdateData.getPromotionValue(), updatedPromotion.getPromotionValue());
//        assertEquals(promotionUpdateData.getPromotionStatus(), updatedPromotion.getPromotionStatus());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionRepository, times(1)).save(any(Promotion.class));
//    }
//
//    @Test
//    void updatePromotion_NonExistingPromotion_ShouldReturnNotFoundResponseEntity() {
//        Integer promotionId = 100;
//        Promotion promotionUpdateData = createPromotion(promotionId, promotionType, expiredStatus, BigDecimal.valueOf(0.25), OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusWeeks(2));
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = promotionService.updatePromotion(promotionId, promotionUpdateData);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Promotion not found", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void deletePromotion_ExistingPromotion_ShouldReturnOkResponseEntity() {
//        Integer promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        PromotionStatus inactiveStatus = createPromotionStatus(1, "Inactive");
//
//        when(promotionRepository.existsById(promotionId)).thenReturn(true);
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(promotionStatusRepository.findById(1)).thenReturn(Optional.of(inactiveStatus));
//        when(promotionRepository.save(any(Promotion.class))).thenReturn(existingPromotion);
//
//
//        ResponseEntity<?> responseEntity = promotionService.deletePromotion(promotionId);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals(null, responseDTO.getMessage()); //Default message in deletePromotion is "" which ResponseDTO will parse to null
//        verify(promotionRepository, times(1)).existsById(promotionId);
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionStatusRepository, times(1)).findById(1);
//        verify(promotionRepository, times(1)).save(any(Promotion.class));
//    }
//
//    @Test
//    void deletePromotion_NonExistingPromotion_ShouldReturnNotFoundResponseEntity() {
//        Integer promotionId = 100;
//        when(promotionRepository.existsById(promotionId)).thenReturn(false);
//
//        ResponseEntity<?> responseEntity = promotionService.deletePromotion(promotionId);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Promotion not found", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).existsById(promotionId);
//        verify(promotionStatusRepository, never()).findById(anyInt());
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void findPromotionById_ExistingPromotion_ShouldReturnPromotionResponseEntity() {
//        Integer promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//
//        ResponseEntity<?> responseEntity = promotionService.findPromotionById(promotionId);
//        Promotion promotionResult = (Promotion) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(promotionResult);
//        assertEquals(existingPromotion.getId(), promotionResult.getId());
//        verify(promotionRepository, times(1)).findById(promotionId);
//    }
//
//    @Test
//    void findPromotionById_NonExistingPromotion_ShouldReturnNotFoundResponseEntity() {
//        Integer promotionId = 100;
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = promotionService.findPromotionById(promotionId);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Promotion not found", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//    }
//
//    @Test
//    void addProductsToPromotion_ExistingPromotionAndProducts_ShouldReturnCreatedResponseEntity() {
//        Integer promotionId = 1;
//        List<String> productIds = Arrays.asList("P001", "P002");
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(promotionProductRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll to avoid actual save
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.addProductsToPromotion(promotionId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(productIds.size())).findById(anyString());
//        verify(promotionProductRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void addProductsToPromotion_NonExistingPromotion_ShouldReturnNotFoundResponseEntity() {
//        Integer promotionId = 100;
//        List<String> productIds = Arrays.asList("P001", "P002");
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.addProductsToPromotion(promotionId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Promotion not found", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, never()).findById(anyString());
//        verify(promotionProductRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void removeProductFromPromotion_ExistingPromotionAndProductInPromotion_ShouldReturnOkResponseEntity() {
//        int promotionId = 1;
//        String productId = "P001";
//        Promotion existingPromotion = promotions.get(0);
//        PromotionProduct promotionProduct = createPromotionProduct(promotionId, productId);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById(productId)).thenReturn(Optional.of(product1));
//        when(promotionProductRepository.findById(any(PromotionProductId.class))).thenReturn(Optional.of(promotionProduct));
//        doNothing().when(promotionProductRepository).delete(promotionProduct);
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.removeProductFromPromotion(promotionId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Product removed successfully from promotion.", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(1)).findById(productId);
//        verify(promotionProductRepository, times(1)).findById(any(PromotionProductId.class));
//        verify(promotionProductRepository, times(1)).delete(promotionProduct);
//    }
//
//    @Test
//    void removeProductFromPromotion_NonExistingPromotion_ShouldReturnNotFoundResponseEntity_PromotionNotFound() {
//        int promotionId = 100;
//        String productId = "P001";
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.removeProductFromPromotion(promotionId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Promotion not found", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, never()).findById(anyString());
//        verify(promotionProductRepository, never()).findById(any(PromotionProductId.class));
//        verify(promotionProductRepository, never()).delete(any());
//    }
//
//    @Test
//    void removeProductFromPromotion_NonExistingProductInPromotion_ShouldReturnNotFoundResponseEntity_ProductNotInPromotion() {
//        int promotionId = 1;
//        String productId = "P003"; // Product not in promotion
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById(productId)).thenReturn(Optional.of(product1)); // Product exists, but not in promotion
//        when(promotionProductRepository.findById(any(PromotionProductId.class))).thenReturn(Optional.empty());
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.removeProductFromPromotion(promotionId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Product not found in this promotion.", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(1)).findById(productId);
//        verify(promotionProductRepository, times(1)).findById(any(PromotionProductId.class));
//        verify(promotionProductRepository, never()).delete(any());
//    }
//
//
//    @Test
//    void getProductsInPromotion_ExistingPromotionWithProducts_ShouldReturnProductListResponseEntity() {
//        int promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        PromotionProduct promotionProduct1 = createPromotionProduct(promotionId, "P001");
//        PromotionProduct promotionProduct2 = createPromotionProduct(promotionId, "P002");
//        List<PromotionProduct> promotionProducts = Arrays.asList(promotionProduct1, promotionProduct2);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(promotionProductRepository.findByIdPromotionId(promotionId)).thenReturn(promotionProducts);
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//
//        ResponseEntity<List<Product>> responseEntity = promotionService.getProductsInPromotion(promotionId);
//        List<Product> productList = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(productList);
//        assertEquals(2, productList.size());
//        assertEquals(product1.getProductId(), productList.get(0).getProductId());
//        assertEquals(product2.getProductId(), productList.get(1).getProductId());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionProductRepository, times(1)).findByIdPromotionId(promotionId);
//        verify(productRepository, times(2)).findById(anyString());
//    }
//
//    @Test
//    void getProductsInPromotion_NonExistingPromotion_ShouldReturnNotFoundResponseEntity_NullBody() {
//        int promotionId = 100;
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());
//
//        ResponseEntity<List<Product>> responseEntity = promotionService.getProductsInPromotion(promotionId);
//        List<Product> productList = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNull(productList); // Expecting null body for 404
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionProductRepository, never()).findByIdPromotionId(anyInt());
//        verify(productRepository, never()).findById(anyString());
//    }
//
//    @Test
//    void getListProductsInPromotions_ShouldReturnResponseEntity() {
//        List<Object[]> mockProductListInPromotions = Arrays.asList(
//                new Object[]{"P001", "Product 1", 1},
//                new Object[]{"P002", "Product 2", 2}
//        );
//        when(promotionProductRepository.getAllProductsInPromotions()).thenReturn(mockProductListInPromotions);
//
//        ResponseEntity<?> responseEntity = promotionService.getListProductsInPromotions();
//        List<Object[]> resultList = (List<Object[]>) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(resultList);
//        assertEquals(2, resultList.size());
//        verify(promotionProductRepository, times(1)).getAllProductsInPromotions();
//    }
//
//    @Test
//    void findAll_NoPromotions_ShouldReturnEmptyList() {
//        when(promotionRepository.findAllByOrderByIdDesc()).thenReturn(Collections.emptyList());
//
//        List<Promotion> result = promotionService.findAll();
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(promotionRepository, times(1)).findAllByOrderByIdDesc();
//    }
//
//    @Test
//    void findAll_PromotionStatusNotFound_ShouldNotThrowExceptionAndProcessOtherPromotions() {
//        List<Promotion> promotionsWithNullStatus = Arrays.asList(
//                createPromotion(1, promotionType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusWeeks(1)),
//                createPromotion(2, promotionType, null, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1)) // Promotion with null status
//        );
//        when(promotionRepository.findAllByOrderByIdDesc()).thenReturn(promotionsWithNullStatus);
//        when(promotionStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(promotionStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(promotionRepository.saveAll(anyList())).thenReturn(promotionsWithNullStatus); // Mock saveAll to avoid actual save
//
//        List<Promotion> result = promotionService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        verify(promotionRepository, times(1)).findAllByOrderByIdDesc();
//        verify(promotionRepository, times(1)).saveAll(anyList());
//    }
//
//
//    @Test
//    void findAll_AllPromotionsExpired_ShouldUpdateAllStatusesToExpired() {
//        List<Promotion> allExpiredPromotions = Arrays.asList(
//                createPromotion(1, promotionType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1)),
//                createPromotion(2, promotionType, activeStatus, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(3), OffsetDateTime.now().minusDays(2))
//        );
//        when(promotionRepository.findAllByOrderByIdDesc()).thenReturn(allExpiredPromotions);
//        when(promotionStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(promotionStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(promotionRepository.saveAll(anyList())).thenReturn(allExpiredPromotions);
//
//        List<Promotion> result = promotionService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(expiredStatus, result.get(0).getPromotionStatus());
//        assertEquals(expiredStatus, result.get(1).getPromotionStatus());
//        verify(promotionRepository, times(1)).findAllByOrderByIdDesc();
//        verify(promotionRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void findAll_NoPromotionsToUpdate_ShouldNotCallSaveAllUnnecessarily() {
//        List<Promotion> noUpdatePromotions = Arrays.asList(
//                createPromotion(1, promotionType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusWeeks(1)),
//                createPromotion(2, promotionType, expiredStatus, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1)) // Already expired
//        );
//        when(promotionRepository.findAllByOrderByIdDesc()).thenReturn(noUpdatePromotions);
//        when(promotionStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(promotionStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(promotionRepository.saveAll(anyList())).thenReturn(noUpdatePromotions);
//
//        List<Promotion> result = promotionService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(activeStatus, result.get(0).getPromotionStatus()); // Status remains active
//        assertEquals(expiredStatus, result.get(1).getPromotionStatus()); // Status remains expired
//        verify(promotionRepository, times(1)).findAllByOrderByIdDesc();
//        verify(promotionRepository, times(1)).saveAll(anyList()); // saveAll still called, logic might need adjustment to avoid unnecessary save
//    }
//
//    @Test
//    void findAll_SaveAllThrowsException_ShouldPropagateException() {
//        List<Promotion> promotionsList = Arrays.asList(promotions.get(0), promotions.get(1));
//        when(promotionRepository.findAllByOrderByIdDesc()).thenReturn(promotionsList);
//        when(promotionStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(promotionStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(promotionRepository.saveAll(anyList())).thenThrow(new RuntimeException("Database error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> promotionService.findAll());
//        assertEquals("Database error", exception.getMessage());
//        verify(promotionRepository, times(1)).findAllByOrderByIdDesc();
//        verify(promotionRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void createPromotion_SaveThrowsException_ShouldPropagateException() {
//        Promotion promotionToCreate = createPromotion(null, promotionType, activeStatus, BigDecimal.valueOf(0.15), OffsetDateTime.now(), OffsetDateTime.now().plusDays(7));
//        when(promotionRepository.save(any(Promotion.class))).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> promotionService.createPromotion(promotionToCreate));
//        assertEquals("Database save error", exception.getMessage());
//        verify(promotionRepository, times(1)).save(any(Promotion.class));
//    }
//
//    @Test
//    void updatePromotion_SaveThrowsException_ShouldPropagateException() {
//        Integer promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        Promotion promotionUpdateData = createPromotion(promotionId, promotionType, expiredStatus, BigDecimal.valueOf(0.25), OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusWeeks(2));
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(promotionRepository.save(any(Promotion.class))).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> promotionService.updatePromotion(promotionId, promotionUpdateData));
//        assertEquals("Database save error", exception.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionRepository, times(1)).save(any(Promotion.class));
//    }
//
//    @Test
//    void deletePromotion_DefaultPromotionStatusNotFound_ShouldThrowEntityNotFoundException() {
//        Integer promotionId = 1;
//        when(promotionRepository.existsById(promotionId)).thenReturn(true);
//        when(promotionStatusRepository.findById(1)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class, () -> promotionService.deletePromotion(promotionId));
//
//        verify(promotionRepository, times(1)).existsById(promotionId);
//        verify(promotionStatusRepository, times(1)).findById(1);
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void deletePromotion_SaveThrowsException_ShouldPropagateException() {
//        Integer promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        PromotionStatus inactiveStatus = createPromotionStatus(1, "Inactive");
//
//        when(promotionRepository.existsById(promotionId)).thenReturn(true);
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(promotionStatusRepository.findById(1)).thenReturn(Optional.of(inactiveStatus));
//        when(promotionRepository.save(any(Promotion.class))).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> promotionService.deletePromotion(promotionId));
//        assertEquals("Database save error", exception.getMessage());
//
//        verify(promotionRepository, times(1)).existsById(promotionId);
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionStatusRepository, times(1)).findById(1);
//        verify(promotionRepository, times(1)).save(any(Promotion.class));
//    }
//
//    @Test
//    void addProductsToPromotion_EmptyProductIdsList_ShouldReturnCreatedResponseEntity() { // Existing logic seems to handle empty list as success
//        Integer promotionId = 1;
//        List<String> productIds = Collections.emptyList();
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.addProductsToPromotion(promotionId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode()); // Existing logic returns CREATED even with empty list
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage()); // Message is still success
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, never()).findById(anyString()); // No product lookup if list is empty
//        verify(promotionProductRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void addProductsToPromotion_MixedValidAndInvalidProductIds_ShouldAddValidProductsAndReturnCreatedResponseEntity() {
//        Integer promotionId = 1;
//        List<String> productIds = Arrays.asList("P001", "NonExistingProduct", "P002");
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("NonExistingProduct")).thenReturn(Optional.empty());
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(promotionProductRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.addProductsToPromotion(promotionId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage()); // Success message even with invalid ids - logic only adds valid ones
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(productIds.size())).findById(anyString()); // Attempt lookup for all ids
//        verify(promotionProductRepository, times(1)).saveAll(anyList()); // Save is still called with valid products
//    }
//
//    @Test
//    void addProductsToPromotion_DuplicateProductIds_ShouldAddProductsWithoutError() { // Assuming service adds duplicates, check actual behavior if different
//        Integer promotionId = 1;
//        List<String> productIds = Arrays.asList("P001", "P001", "P002"); // Duplicate product IDs
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(promotionProductRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.addProductsToPromotion(promotionId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(productIds.size())).findById(anyString()); // Look up for each ID including duplicates
//        verify(promotionProductRepository, times(1)).saveAll(anyList()); // Save is called
//    }
//
//
//    @Test
//    void addProductsToPromotion_SaveAllThrowsException_ShouldPropagateException() {
//        Integer promotionId = 1;
//        List<String> productIds = Arrays.asList("P001", "P002");
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(promotionProductRepository.saveAll(anyList())).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> promotionService.addProductsToPromotion(promotionId, productIds));
//        assertEquals("Database save error", exception.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(productIds.size())).findById(anyString());
//        verify(promotionProductRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void removeProductFromPromotion_NonExistingProduct_ShouldReturnNotFoundResponseEntity_ProductNotFound() {
//        int promotionId = 1;
//        String productId = "NonExistingProduct";
//        Promotion existingPromotion = promotions.get(0);
//
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(productRepository.findById(productId)).thenReturn(Optional.empty()); // Product not found
//
//        ResponseEntity<ResponseDTO> responseEntity = promotionService.removeProductFromPromotion(promotionId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Product not found", responseDTO.getMessage());
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(productRepository, times(1)).findById(productId);
//        verify(promotionProductRepository, never()).findById(any(PromotionProductId.class));
//        verify(promotionProductRepository, never()).delete(any());
//    }
//
//    @Test
//    void getProductsInPromotion_ExistingPromotionNoProducts_ShouldReturnEmptyProductListResponseEntity() {
//        int promotionId = 1;
//        Promotion existingPromotion = promotions.get(0);
//        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(existingPromotion));
//        when(promotionProductRepository.findByIdPromotionId(promotionId)).thenReturn(Collections.emptyList()); // No promotion products
//
//        ResponseEntity<List<Product>> responseEntity = promotionService.getProductsInPromotion(promotionId);
//        List<Product> productList = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(productList);
//        assertTrue(productList.isEmpty()); // Expecting empty list
//        verify(promotionRepository, times(1)).findById(promotionId);
//        verify(promotionProductRepository, times(1)).findByIdPromotionId(promotionId);
//        verify(productRepository, never()).findById(anyString()); // No product lookup if no promotion products
//    }
//
//
//    // Helper methods to create mock entities
//    private Promotion createPromotion(Integer id, PromotionType promotionType, PromotionStatus promotionStatus, BigDecimal promotionValue, OffsetDateTime startDate, OffsetDateTime endDate) {
//        Promotion promotion = new Promotion();
//        promotion.setId(id);
//        promotion.setPromotionType(promotionType);
//        promotion.setPromotionStatus(promotionStatus);
//        promotion.setPromotionValue(promotionValue);
//        promotion.setPromotionStartDate(startDate);
//        promotion.setPromotionEndDate(endDate);
//        promotion.setPromotionCreatedAt(OffsetDateTime.now());
//        promotion.setPromotionUpdatedAt(OffsetDateTime.now());
//        return promotion;
//    }
//
//    private PromotionType createPromotionType(Integer id, String name) {
//        PromotionType promotionType = new PromotionType();
//        promotionType.setId(id);
//        promotionType.setPromotionTypeName(name);
//        return promotionType;
//    }
//    private PromotionStatus createPromotionStatus(Integer id, String name) {
//        PromotionStatus promotionStatus = new PromotionStatus();
//        promotionStatus.setId(id);
//        promotionStatus.setPromotionStatusName(name);
//        return promotionStatus;
//    }
//
//    private Product createProduct(String productId, String productName, String description, BigDecimal price, String category) {
//        Product product = new Product();
//        product.setProductId(productId);
//        product.setProductName(productName);
//        product.setProductDescription(description);
//        return product;
//    }
//
//    private PromotionProduct createPromotionProduct(int promotionId, String productId) {
//        PromotionProduct promotionProduct = new PromotionProduct();
//        PromotionProductId id = new PromotionProductId();
//        id.setPromotionId(promotionId);
//        id.setProductId(productId);
//        promotionProduct.setId(id);
//        return promotionProduct;
//    }
//}