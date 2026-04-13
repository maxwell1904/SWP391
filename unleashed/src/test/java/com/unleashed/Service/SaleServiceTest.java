//package com.unleashed.Service;
//
//import com.unleashed.dto.ResponseDTO;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.SaleProductId;
//import com.unleashed.repo.ProductRepository;
//import com.unleashed.repo.SaleProductRepository;
//import com.unleashed.repo.SaleRepository;
//import com.unleashed.repo.SaleStatusRepository;
//import com.unleashed.service.SaleService;
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
//public class SaleServiceTest {
//
//    @Autowired
//    private SaleService saleService;
//
//    @MockBean
//    private SaleRepository saleRepository;
//
//    @MockBean
//    private ProductRepository productRepository;
//
//    @MockBean
//    private SaleProductRepository saleProductRepository;
//
//    @MockBean
//    private SaleStatusRepository saleStatusRepository;
//
//    private List<Sale> sales;
//    private SaleStatus activeStatus;
//    private SaleStatus inactiveStatus;
//    private SaleStatus expiredStatus;
//    private SaleType saleType;
//    private Product product1;
//    private Product product2;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        saleType = createSaleType(1, "Percentage");
//        activeStatus = createSaleStatus(2, "Active");
//        inactiveStatus = createSaleStatus(1, "Inactive");
//        expiredStatus = createSaleStatus(3, "Expired");
//
//        product1 = createProduct("P001", "Product 1", "Description 1", BigDecimal.valueOf(10.00), "Category 1");
//        product2 = createProduct("P002", "Product 2", "Description 2", BigDecimal.valueOf(20.00), "Category 2");
//
//
//        sales = Arrays.asList(
//                createSale(1, saleType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusWeeks(1)),
//                createSale(2, saleType, inactiveStatus, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1))
//        );
//    }
//
//    @Test
//    void findAll_ShouldReturnAllSalesAndUpdateStatus() {
//        when(saleRepository.findAllByOrderByIdDesc()).thenReturn(sales);
//        when(saleStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(saleStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(saleRepository.saveAll(anyList())).thenReturn(sales);
//
//        List<Sale> result = saleService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(expiredStatus, result.get(1).getSaleStatus()); // Second sale should be expired
//        verify(saleRepository, times(1)).findAllByOrderByIdDesc();
//        verify(saleRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void createSale_ShouldReturnCreatedSale() {
//        Sale saleToCreate = createSale(null, saleType, activeStatus, BigDecimal.valueOf(0.15), OffsetDateTime.now(), OffsetDateTime.now().plusDays(7));
//        Sale savedSale = createSale(3, saleType, activeStatus, BigDecimal.valueOf(0.15), OffsetDateTime.now(), OffsetDateTime.now().plusDays(7)); // Simulate saved sale with ID
//        when(saleRepository.save(any(Sale.class))).thenReturn(savedSale);
//
//        Sale createdSale = saleService.createSale(saleToCreate);
//
//        assertNotNull(createdSale);
//        assertEquals(savedSale.getId(), createdSale.getId());
//        assertEquals(saleToCreate.getSaleValue(), createdSale.getSaleValue());
//        verify(saleRepository, times(1)).save(any(Sale.class));
//    }
//
//    @Test
//    void updateSale_ExistingSale_ShouldReturnUpdatedSaleResponseEntity() {
//        Integer saleId = 1;
//        Sale existingSale = sales.get(0);
//        Sale saleUpdateData = createSale(saleId, saleType, expiredStatus, BigDecimal.valueOf(0.25), OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusWeeks(2));
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(saleRepository.save(any(Sale.class))).thenReturn(saleUpdateData);
//
//        ResponseEntity<?> responseEntity = saleService.updateSale(saleId, saleUpdateData);
//        Sale updatedSale = (Sale) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(updatedSale);
//        assertEquals(saleUpdateData.getSaleValue(), updatedSale.getSaleValue());
//        assertEquals(saleUpdateData.getSaleStatus(), updatedSale.getSaleStatus());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleRepository, times(1)).save(any(Sale.class));
//    }
//
//    @Test
//    void updateSale_NonExistingSale_ShouldReturnNotFoundResponseEntity() {
//        Integer saleId = 100;
//        Sale saleUpdateData = createSale(saleId, saleType, expiredStatus, BigDecimal.valueOf(0.25), OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusWeeks(2));
//        when(saleRepository.findById(saleId)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = saleService.updateSale(saleId, saleUpdateData);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Sale not found", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleRepository, never()).save(any(Sale.class));
//    }
//
//    @Test
//    void deleteSale_ExistingSale_ShouldReturnOkResponseEntity() {
//        Integer saleId = 1;
//        Sale existingSale = sales.get(0);
//        SaleStatus inactiveStatus = createSaleStatus(1, "Inactive");
//
//        when(saleRepository.existsById(saleId)).thenReturn(true);
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(saleStatusRepository.findById(1)).thenReturn(Optional.of(inactiveStatus));
//        when(saleRepository.save(any(Sale.class))).thenReturn(existingSale);
//
//
//        ResponseEntity<?> responseEntity = saleService.deleteSale(saleId);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals(null, responseDTO.getMessage()); //Default message in deleteSale is "" which ResponseDTO will parse to null
//        verify(saleRepository, times(1)).existsById(saleId);
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleStatusRepository, times(1)).findById(1);
//        verify(saleRepository, times(1)).save(any(Sale.class));
//    }
//
//    @Test
//    void deleteSale_NonExistingSale_ShouldReturnNotFoundResponseEntity() {
//        Integer saleId = 100;
//        when(saleRepository.existsById(saleId)).thenReturn(false);
//
//        ResponseEntity<?> responseEntity = saleService.deleteSale(saleId);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Sale not found", responseDTO.getMessage());
//        verify(saleRepository, times(1)).existsById(saleId);
//        verify(saleStatusRepository, never()).findById(anyInt());
//        verify(saleRepository, never()).save(any(Sale.class));
//    }
//
//    @Test
//    void findSaleById_ExistingSale_ShouldReturnSaleResponseEntity() {
//        Integer saleId = 1;
//        Sale existingSale = sales.get(0);
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//
//        ResponseEntity<?> responseEntity = saleService.findSaleById(saleId);
//        Sale saleResult = (Sale) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(saleResult);
//        assertEquals(existingSale.getId(), saleResult.getId());
//        verify(saleRepository, times(1)).findById(saleId);
//    }
//
//    @Test
//    void findSaleById_NonExistingSale_ShouldReturnNotFoundResponseEntity() {
//        Integer saleId = 100;
//        when(saleRepository.findById(saleId)).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = saleService.findSaleById(saleId);
//        ResponseDTO responseDTO = (ResponseDTO) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Sale not found", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//    }
//
//    @Test
//    void addProductsToSale_ExistingSaleAndProducts_ShouldReturnCreatedResponseEntity() {
//        Integer saleId = 1;
//        List<String> productIds = Arrays.asList("P001", "P002");
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(saleProductRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll to avoid actual save
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.addProductsToSale(saleId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(productIds.size())).findById(anyString());
//        verify(saleProductRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void addProductsToSale_NonExistingSale_ShouldReturnNotFoundResponseEntity() {
//        Integer saleId = 100;
//        List<String> productIds = Arrays.asList("P001", "P002");
//        when(saleRepository.findById(saleId)).thenReturn(Optional.empty());
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.addProductsToSale(saleId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Sale not found", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, never()).findById(anyString());
//        verify(saleProductRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void removeProductFromSale_ExistingSaleAndProductInSale_ShouldReturnOkResponseEntity() {
//        int saleId = 1;
//        String productId = "P001";
//        Sale existingSale = sales.get(0);
//        SaleProduct saleProduct = createSaleProduct(saleId, productId);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById(productId)).thenReturn(Optional.of(product1));
//        when(saleProductRepository.findById(any(SaleProductId.class))).thenReturn(Optional.of(saleProduct));
//        doNothing().when(saleProductRepository).delete(saleProduct);
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.removeProductFromSale(saleId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Product removed successfully from sale.", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(1)).findById(productId);
//        verify(saleProductRepository, times(1)).findById(any(SaleProductId.class));
//        verify(saleProductRepository, times(1)).delete(saleProduct);
//    }
//
//    @Test
//    void removeProductFromSale_NonExistingSale_ShouldReturnNotFoundResponseEntity_SaleNotFound() {
//        int saleId = 100;
//        String productId = "P001";
//        when(saleRepository.findById(saleId)).thenReturn(Optional.empty());
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.removeProductFromSale(saleId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Sale not found", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, never()).findById(anyString());
//        verify(saleProductRepository, never()).findById(any(SaleProductId.class));
//        verify(saleProductRepository, never()).delete(any());
//    }
//
//    @Test
//    void removeProductFromSale_NonExistingProductInSale_ShouldReturnNotFoundResponseEntity_ProductNotInSale() {
//        int saleId = 1;
//        String productId = "P003"; // Product not in sale
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById(productId)).thenReturn(Optional.of(product1)); // Product exists, but not in sale
//        when(saleProductRepository.findById(any(SaleProductId.class))).thenReturn(Optional.empty());
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.removeProductFromSale(saleId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Product not found in this sale.", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(1)).findById(productId);
//        verify(saleProductRepository, times(1)).findById(any(SaleProductId.class));
//        verify(saleProductRepository, never()).delete(any());
//    }
//
//
//    @Test
//    void getProductsInSale_ExistingSaleWithProducts_ShouldReturnProductListResponseEntity() {
//        int saleId = 1;
//        Sale existingSale = sales.get(0);
//        SaleProduct saleProduct1 = createSaleProduct(saleId, "P001");
//        SaleProduct saleProduct2 = createSaleProduct(saleId, "P002");
//        List<SaleProduct> saleProducts = Arrays.asList(saleProduct1, saleProduct2);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(saleProductRepository.findByIdSaleId(saleId)).thenReturn(saleProducts);
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//
//        ResponseEntity<List<Product>> responseEntity = saleService.getProductsInSale(saleId);
//        List<Product> productList = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(productList);
//        assertEquals(2, productList.size());
//        assertEquals(product1.getProductId(), productList.get(0).getProductId());
//        assertEquals(product2.getProductId(), productList.get(1).getProductId());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleProductRepository, times(1)).findByIdSaleId(saleId);
//        verify(productRepository, times(2)).findById(anyString());
//    }
//
//    @Test
//    void getProductsInSale_NonExistingSale_ShouldReturnNotFoundResponseEntity_NullBody() {
//        int saleId = 100;
//        when(saleRepository.findById(saleId)).thenReturn(Optional.empty());
//
//        ResponseEntity<List<Product>> responseEntity = saleService.getProductsInSale(saleId);
//        List<Product> productList = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNull(productList); // Expecting null body for 404
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleProductRepository, never()).findByIdSaleId(anyInt());
//        verify(productRepository, never()).findById(anyString());
//    }
//
//    @Test
//    void getListProductsInSales_ShouldReturnResponseEntity() {
//        List<Object[]> mockProductListInSales = Arrays.asList(
//                new Object[]{"P001", "Product 1", 1},
//                new Object[]{"P002", "Product 2", 2}
//        );
//        when(saleProductRepository.getAllProductsInSales()).thenReturn(mockProductListInSales);
//
//        ResponseEntity<?> responseEntity = saleService.getListProductsInSales();
//        List<Object[]> resultList = (List<Object[]>) responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(resultList);
//        assertEquals(2, resultList.size());
//        verify(saleProductRepository, times(1)).getAllProductsInSales();
//    }
//
//    @Test
//    void findAll_NoSales_ShouldReturnEmptyList() {
//        when(saleRepository.findAllByOrderByIdDesc()).thenReturn(Collections.emptyList());
//
//        List<Sale> result = saleService.findAll();
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(saleRepository, times(1)).findAllByOrderByIdDesc();
//    }
//
//    @Test
//    void findAll_SaleStatusNotFound_ShouldNotThrowExceptionAndProcessOtherSales() {
//        List<Sale> salesWithNullStatus = Arrays.asList(
//                createSale(1, saleType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusWeeks(1)),
//                createSale(2, saleType, null, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1)) // Sale with null status
//        );
//        when(saleRepository.findAllByOrderByIdDesc()).thenReturn(salesWithNullStatus);
//        when(saleStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(saleStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(saleRepository.saveAll(anyList())).thenReturn(salesWithNullStatus); // Mock saveAll to avoid actual save
//
//        List<Sale> result = saleService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        verify(saleRepository, times(1)).findAllByOrderByIdDesc();
//        verify(saleRepository, times(1)).saveAll(anyList());
//    }
//
//
//    @Test
//    void findAll_AllSalesExpired_ShouldUpdateAllStatusesToExpired() {
//        List<Sale> allExpiredSales = Arrays.asList(
//                createSale(1, saleType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1)),
//                createSale(2, saleType, activeStatus, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(3), OffsetDateTime.now().minusDays(2))
//        );
//        when(saleRepository.findAllByOrderByIdDesc()).thenReturn(allExpiredSales);
//        when(saleStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(saleStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(saleRepository.saveAll(anyList())).thenReturn(allExpiredSales);
//
//        List<Sale> result = saleService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(expiredStatus, result.get(0).getSaleStatus());
//        assertEquals(expiredStatus, result.get(1).getSaleStatus());
//        verify(saleRepository, times(1)).findAllByOrderByIdDesc();
//        verify(saleRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void findAll_NoSalesToUpdate_ShouldNotCallSaveAllUnnecessarily() {
//        List<Sale> noUpdateSales = Arrays.asList(
//                createSale(1, saleType, activeStatus, BigDecimal.valueOf(0.1), OffsetDateTime.now().plusDays(1), OffsetDateTime.now().plusWeeks(1)),
//                createSale(2, saleType, expiredStatus, BigDecimal.valueOf(0.2), OffsetDateTime.now().minusDays(2), OffsetDateTime.now().minusDays(1)) // Already expired
//        );
//        when(saleRepository.findAllByOrderByIdDesc()).thenReturn(noUpdateSales);
//        when(saleStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(saleStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(saleRepository.saveAll(anyList())).thenReturn(noUpdateSales);
//
//        List<Sale> result = saleService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(activeStatus, result.get(0).getSaleStatus()); // Status remains active
//        assertEquals(expiredStatus, result.get(1).getSaleStatus()); // Status remains expired
//        verify(saleRepository, times(1)).findAllByOrderByIdDesc();
//        verify(saleRepository, times(1)).saveAll(anyList()); // saveAll still called, logic might need adjustment to avoid unnecessary save
//    }
//
//    @Test
//    void findAll_SaveAllThrowsException_ShouldPropagateException() {
//        List<Sale> salesList = Arrays.asList(sales.get(0), sales.get(1));
//        when(saleRepository.findAllByOrderByIdDesc()).thenReturn(salesList);
//        when(saleStatusRepository.getReferenceById(3)).thenReturn(expiredStatus);
//        when(saleStatusRepository.getReferenceById(1)).thenReturn(inactiveStatus);
//        when(saleRepository.saveAll(anyList())).thenThrow(new RuntimeException("Database error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> saleService.findAll());
//        assertEquals("Database error", exception.getMessage());
//        verify(saleRepository, times(1)).findAllByOrderByIdDesc();
//        verify(saleRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void createSale_SaveThrowsException_ShouldPropagateException() {
//        Sale saleToCreate = createSale(null, saleType, activeStatus, BigDecimal.valueOf(0.15), OffsetDateTime.now(), OffsetDateTime.now().plusDays(7));
//        when(saleRepository.save(any(Sale.class))).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> saleService.createSale(saleToCreate));
//        assertEquals("Database save error", exception.getMessage());
//        verify(saleRepository, times(1)).save(any(Sale.class));
//    }
//
//    @Test
//    void updateSale_SaveThrowsException_ShouldPropagateException() {
//        Integer saleId = 1;
//        Sale existingSale = sales.get(0);
//        Sale saleUpdateData = createSale(saleId, saleType, expiredStatus, BigDecimal.valueOf(0.25), OffsetDateTime.now().plusDays(2), OffsetDateTime.now().plusWeeks(2));
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(saleRepository.save(any(Sale.class))).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> saleService.updateSale(saleId, saleUpdateData));
//        assertEquals("Database save error", exception.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleRepository, times(1)).save(any(Sale.class));
//    }
//
//    @Test
//    void deleteSale_DefaultSaleStatusNotFound_ShouldThrowEntityNotFoundException() {
//        Integer saleId = 1;
//        when(saleRepository.existsById(saleId)).thenReturn(true);
//        when(saleStatusRepository.findById(1)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class, () -> saleService.deleteSale(saleId));
//
//        verify(saleRepository, times(1)).existsById(saleId);
//        verify(saleStatusRepository, times(1)).findById(1);
//        verify(saleRepository, never()).save(any(Sale.class));
//    }
//
//    @Test
//    void deleteSale_SaveThrowsException_ShouldPropagateException() {
//        Integer saleId = 1;
//        Sale existingSale = sales.get(0);
//        SaleStatus inactiveStatus = createSaleStatus(1, "Inactive");
//
//        when(saleRepository.existsById(saleId)).thenReturn(true);
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(saleStatusRepository.findById(1)).thenReturn(Optional.of(inactiveStatus));
//        when(saleRepository.save(any(Sale.class))).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> saleService.deleteSale(saleId));
//        assertEquals("Database save error", exception.getMessage());
//
//        verify(saleRepository, times(1)).existsById(saleId);
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleStatusRepository, times(1)).findById(1);
//        verify(saleRepository, times(1)).save(any(Sale.class));
//    }
//
//    @Test
//    void addProductsToSale_EmptyProductIdsList_ShouldReturnCreatedResponseEntity() { // Existing logic seems to handle empty list as success
//        Integer saleId = 1;
//        List<String> productIds = Collections.emptyList();
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.addProductsToSale(saleId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode()); // Existing logic returns CREATED even with empty list
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage()); // Message is still success
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, never()).findById(anyString()); // No product lookup if list is empty
//        verify(saleProductRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void addProductsToSale_MixedValidAndInvalidProductIds_ShouldAddValidProductsAndReturnCreatedResponseEntity() {
//        Integer saleId = 1;
//        List<String> productIds = Arrays.asList("P001", "NonExistingProduct", "P002");
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("NonExistingProduct")).thenReturn(Optional.empty());
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(saleProductRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.addProductsToSale(saleId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage()); // Success message even with invalid ids - logic only adds valid ones
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(productIds.size())).findById(anyString()); // Attempt lookup for all ids
//        verify(saleProductRepository, times(1)).saveAll(anyList()); // Save is still called with valid products
//    }
//
//    @Test
//    void addProductsToSale_DuplicateProductIds_ShouldAddProductsWithoutError() { // Assuming service adds duplicates, check actual behavior if different
//        Integer saleId = 1;
//        List<String> productIds = Arrays.asList("P001", "P001", "P002"); // Duplicate product IDs
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(saleProductRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.addProductsToSale(saleId, productIds);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Products added successfully", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(productIds.size())).findById(anyString()); // Look up for each ID including duplicates
//        verify(saleProductRepository, times(1)).saveAll(anyList()); // Save is called
//    }
//
//
//    @Test
//    void addProductsToSale_SaveAllThrowsException_ShouldPropagateException() {
//        Integer saleId = 1;
//        List<String> productIds = Arrays.asList("P001", "P002");
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById("P001")).thenReturn(Optional.of(product1));
//        when(productRepository.findById("P002")).thenReturn(Optional.of(product2));
//        when(saleProductRepository.saveAll(anyList())).thenThrow(new RuntimeException("Database save error"));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> saleService.addProductsToSale(saleId, productIds));
//        assertEquals("Database save error", exception.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(productIds.size())).findById(anyString());
//        verify(saleProductRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void removeProductFromSale_NonExistingProduct_ShouldReturnNotFoundResponseEntity_ProductNotFound() {
//        int saleId = 1;
//        String productId = "NonExistingProduct";
//        Sale existingSale = sales.get(0);
//
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(productRepository.findById(productId)).thenReturn(Optional.empty()); // Product not found
//
//        ResponseEntity<ResponseDTO> responseEntity = saleService.removeProductFromSale(saleId, productId);
//        ResponseDTO responseDTO = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        assertNotNull(responseDTO);
//        assertEquals("Product not found", responseDTO.getMessage());
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(productRepository, times(1)).findById(productId);
//        verify(saleProductRepository, never()).findById(any(SaleProductId.class));
//        verify(saleProductRepository, never()).delete(any());
//    }
//
//    @Test
//    void getProductsInSale_ExistingSaleNoProducts_ShouldReturnEmptyProductListResponseEntity() {
//        int saleId = 1;
//        Sale existingSale = sales.get(0);
//        when(saleRepository.findById(saleId)).thenReturn(Optional.of(existingSale));
//        when(saleProductRepository.findByIdSaleId(saleId)).thenReturn(Collections.emptyList()); // No sale products
//
//        ResponseEntity<List<Product>> responseEntity = saleService.getProductsInSale(saleId);
//        List<Product> productList = responseEntity.getBody();
//
//        assertNotNull(responseEntity);
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertNotNull(productList);
//        assertTrue(productList.isEmpty()); // Expecting empty list
//        verify(saleRepository, times(1)).findById(saleId);
//        verify(saleProductRepository, times(1)).findByIdSaleId(saleId);
//        verify(productRepository, never()).findById(anyString()); // No product lookup if no sale products
//    }
//
//
//    // Helper methods to create mock entities
//    private Sale createSale(Integer id, SaleType saleType, SaleStatus saleStatus, BigDecimal saleValue, OffsetDateTime startDate, OffsetDateTime endDate) {
//        Sale sale = new Sale();
//        sale.setId(id);
//        sale.setSaleType(saleType);
//        sale.setSaleStatus(saleStatus);
//        sale.setSaleValue(saleValue);
//        sale.setSaleStartDate(startDate);
//        sale.setSaleEndDate(endDate);
//        sale.setSaleCreatedAt(OffsetDateTime.now());
//        sale.setSaleUpdatedAt(OffsetDateTime.now());
//        return sale;
//    }
//
//    private SaleType createSaleType(Integer id, String name) {
//        SaleType saleType = new SaleType();
//        saleType.setId(id);
//        saleType.setSaleTypeName(name);
//        return saleType;
//    }
//    private SaleStatus createSaleStatus(Integer id, String name) {
//        SaleStatus saleStatus = new SaleStatus();
//        saleStatus.setId(id);
//        saleStatus.setSaleStatusName(name);
//        return saleStatus;
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
//    private SaleProduct createSaleProduct(int saleId, String productId) {
//        SaleProduct saleProduct = new SaleProduct();
//        SaleProductId id = new SaleProductId();
//        id.setSaleId(saleId);
//        id.setProductId(productId);
//        saleProduct.setId(id);
//        return saleProduct;
//    }
//}