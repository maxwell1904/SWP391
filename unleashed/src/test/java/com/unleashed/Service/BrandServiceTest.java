//package com.unleashed.Service;
//
//import com.unleashed.dto.BrandDTO;
//import com.unleashed.dto.SearchBrandDTO;
//import com.unleashed.entity.Brand;
//import com.unleashed.repo.BrandRepository;
//import com.unleashed.repo.ProductRepository;
//import com.unleashed.service.BrandService;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//
//import java.sql.Timestamp;
//import java.time.Instant;
//import java.time.OffsetDateTime;
//import java.time.ZoneOffset;
//import java.util.Arrays;
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class BrandServiceTest {
//
//    @Autowired
//    private BrandService brandService;
//
//    @MockBean
//    private BrandRepository brandRepository;
//
//    @MockBean
//    private ProductRepository productRepository;
//
//    private List<Brand> defaultBrands; // Khai báo danh sách Brand mặc định
//
//    @BeforeEach
//        // Method này sẽ chạy trước mỗi test method
//    void setUp() {
//        // Khởi tạo danh sách Brand mặc định
//        Brand brand1 = new Brand();
//        brand1.setId(1);
//        brand1.setBrandName("Brand 1");
//        brand1.setBrandWebsiteUrl("https://newbrand1.com");
//        Brand brand2 = new Brand();
//        brand2.setId(2);
//        brand2.setBrandName("Brand 2");
//        brand2.setBrandWebsiteUrl("https://newbrand2.com");
//        defaultBrands = Arrays.asList(brand1, brand2);
//
//        // Mock hành vi mặc định cho brandRepository.findAll()
//        when(brandRepository.findAll()).thenReturn(defaultBrands);
//    }
//
//
//
//    @Test
//    void findAll_ReturnsList() {
//        // Gan du lieu
//        List<Brand> result = brandService.findAll();
//
//        // Kiem tra
//        assertEquals(2, result.size());
//        assertEquals("Brand 1", result.get(0).getBrandName());
//        assertEquals("Brand 2", result.get(1).getBrandName());
//        verify(brandRepository, times(1)).findAll();
//    }
//
//    @Test
//    void findAll_ReturnsEmptyList() {
//        // Khoi tao
//        when(brandRepository.findAll()).thenReturn(Collections.emptyList());
//
//        // Gan du lieu
//        List<Brand> result = brandService.findAll();
//
//        // Kiem tra
//        assertTrue(result.isEmpty());
//        verify(brandRepository, times(1)).findAll();
//    }
//
//    @Test
//    void findById_ReturnsBrand() {
//        when(brandRepository.findById(defaultBrands.get(0).getId())).thenReturn(Optional.of(defaultBrands.get(0)));
//
//        // Gan du lieu
//        Brand result = brandService.findById(defaultBrands.get(0).getId());
//
//        // Kiem tra
//        assertNotNull(result);
//        assertEquals(defaultBrands.get(0).getId(), result.getId());
//        assertEquals("Brand 1", result.getBrandName());
//        verify(brandRepository, times(1)).findById(defaultBrands.get(0).getId());
//    }
//
//    @Test
//    void findById_ReturnsNull() {
//        // Khoi tao
//        int brandId = 1;
//        when(brandRepository.findById(brandId)).thenReturn(Optional.empty());
//
//        // Gan du lieu
//        Brand result = brandService.findById(brandId);
//
//        // Kiem tra
//        assertNull(result);
//        verify(brandRepository, times(1)).findById(brandId);
//    }
//
//    @Test
//    void createBrand_ReturnsCreatedBrand() {
//        // Khoi tao
//        when(brandRepository.existsByBrandName(defaultBrands.get(0).getBrandName())).thenReturn(false);
//        when(brandRepository.existsByBrandWebsiteUrl(defaultBrands.get(0).getBrandWebsiteUrl())).thenReturn(false);
//        when(brandRepository.save(defaultBrands.get(0))).thenReturn(defaultBrands.get(0));
//
//        // Gan du lieu
//        assertThrows(RuntimeException.class, () -> brandService.createBrand(defaultBrands.get(0)));
//        // Kiem tra
//        verify(brandRepository, times(1)).existsByBrandName(defaultBrands.get(0).getBrandName());
//        verify(brandRepository, times(1)).existsByBrandWebsiteUrl(defaultBrands.get(0).getBrandWebsiteUrl());
//    }
//
//    @Test
//    void createBrand_ThrowsRuntimeException() {
//        // Khoi tao
//        Brand brand = new Brand();
//        brand.setBrandName("Existing Brand");
//        when(brandRepository.existsByBrandName(brand.getBrandName())).thenReturn(true);
//
//        // Kiem tra
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.createBrand(brand));
//        assertEquals("Brand already exists with name: Existing Brand", exception.getMessage());
//        verify(brandRepository, times(1)).existsByBrandName(brand.getBrandName());
//        verify(brandRepository, never()).existsByBrandWebsiteUrl(anyString());
//        verify(brandRepository, never()).save(any());
//    }
//
//    @Test
//    void createBrand_Url_ThrowsRuntimeException() {
//        // Khoi tao
//        Brand brand = new Brand();
//        brand.setBrandName("New Brand");
//        brand.setBrandWebsiteUrl("https://existingwebsite.com");
//        when(brandRepository.existsByBrandName(brand.getBrandName())).thenReturn(false);
//        when(brandRepository.existsByBrandWebsiteUrl(brand.getBrandWebsiteUrl())).thenReturn(true);
//
//        // Kiem tra
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.createBrand(brand));
//        assertEquals("Brand already exists with website url: https://existingwebsite.com", exception.getMessage());
//        verify(brandRepository, times(1)).existsByBrandName(brand.getBrandName());
//        verify(brandRepository, times(1)).existsByBrandWebsiteUrl(brand.getBrandWebsiteUrl());
//        verify(brandRepository, never()).save(any());
//    }
//
//    @Test
//    void getAllBrands_ReturnsListBrand() {
//        // Khoi tao
//        Brand brand1 = new Brand();
//        brand1.setBrandName("Brand 1");
//        brand1.setBrandDescription("Description 1");
//        Brand brand2 = new Brand();
//        brand2.setBrandName("Brand 2");
//        brand2.setBrandDescription("Description 2");
//        List<Brand> brands = Arrays.asList(brand1, brand2);
//        when(brandRepository.findAll()).thenReturn(brands);
//
//        // Gan du lieu
//        List<SearchBrandDTO> result = brandService.getAllBrands();
//
//        // Kiem tra
//        assertEquals(2, result.size());
//        assertEquals("Brand 1", result.get(0).getBrandName());
//        assertEquals("Description 1", result.get(0).getBrandDescription());
//        assertEquals("Brand 2", result.get(1).getBrandName());
//        assertEquals("Description 2", result.get(1).getBrandDescription());
//        verify(brandRepository, times(1)).findAll();
//    }
//
//    @Test
//    void getAllBrands_ReturnsEmptyListBrand() {
//        // Khoi tao
//        when(brandRepository.findAll()).thenReturn(Collections.emptyList());
//
//        // Gan du lieu
//        List<SearchBrandDTO> result = brandService.getAllBrands();
//
//        // Kiem tra
//        assertTrue(result.isEmpty());
//        verify(brandRepository, times(1)).findAll();
//    }
//
//    @Test
//    void updateBrand_ReturnsUpdatedBrand() {
//        // Khoi tao
//        int brandId = 1;
//        Brand existingBrand = new Brand();
//        existingBrand.setId(brandId);
//        existingBrand.setBrandName("Old Brand Name");
//        existingBrand.setBrandWebsiteUrl("https://oldwebsite.com");
//
//        Brand updatedBrand = new Brand();
//        updatedBrand.setId(brandId);
//        updatedBrand.setBrandName("New Brand Name");
//        updatedBrand.setBrandDescription("New Description");
//        updatedBrand.setBrandImageUrl("new_image.jpg");
//        updatedBrand.setBrandWebsiteUrl("https://newwebsite.com");
//
//        when(brandRepository.findById(brandId)).thenReturn(Optional.of(existingBrand));
//        when(brandRepository.existsByBrandName(updatedBrand.getBrandName())).thenReturn(false);
//        when(brandRepository.existsByBrandWebsiteUrl(updatedBrand.getBrandWebsiteUrl())).thenReturn(false);
//        when(brandRepository.save(existingBrand)).thenReturn(updatedBrand);
//
//        // Gan du lieu
//        Brand result = brandService.updateBrand(updatedBrand);
//
//        // Kiem tra
//        assertNotNull(result);
//        assertEquals("New Brand Name", result.getBrandName());
//        assertEquals("New Description", result.getBrandDescription());
//        assertEquals("new_image.jpg", result.getBrandImageUrl());
//        assertEquals("https://newwebsite.com", result.getBrandWebsiteUrl());
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(brandRepository, times(1)).existsByBrandName(updatedBrand.getBrandName());
//        verify(brandRepository, times(1)).existsByBrandWebsiteUrl(updatedBrand.getBrandWebsiteUrl());
//        verify(brandRepository, times(1)).save(existingBrand);
//    }
//
//    @Test
//    void updateBrand_ReturnsNull() {
//        // Khoi tao
//        int brandId = 1;
//        Brand updatedBrand = new Brand();
//        updatedBrand.setId(brandId);
//        when(brandRepository.findById(brandId)).thenReturn(Optional.empty());
//
//        // Gan du lieu
//        assertThrows(RuntimeException.class, () -> brandService.updateBrand(updatedBrand));
//
//        // Kiem tra
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(brandRepository, never()).existsByBrandName(anyString());
//        verify(brandRepository, never()).existsByBrandWebsiteUrl(anyString());
//        verify(brandRepository, never()).save(any());
//    }
//
//    @Test
//    void updateBrand_ThrowsRuntimeException() {
//        // Khoi tao
//        int brandId = 1;
//        Brand existingBrand = new Brand();
//        existingBrand.setId(brandId);
//        existingBrand.setBrandName("Old Brand Name");
//
//        Brand updatedBrand = new Brand();
//        updatedBrand.setId(brandId);
//        updatedBrand.setBrandName("Existing Brand Name"); // Name already exists
//
//        when(brandRepository.findById(brandId)).thenReturn(Optional.of(existingBrand));
//        when(brandRepository.existsByBrandName(updatedBrand.getBrandName())).thenReturn(true);
//
//        // Kiem tra
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.updateBrand(updatedBrand));
//        assertEquals("Brand description cannot be null or empty", exception.getMessage());
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(brandRepository, never()).save(any());
//    }
//
//    @Test
//    void updateBrand_Url_ThrowsRuntimeException() {
//        // Khoi tao
//        int brandId = 1;
//        Brand existingBrand = new Brand();
//        existingBrand.setId(brandId);
//        existingBrand.setBrandName("Old Brand Name");
//        existingBrand.setBrandWebsiteUrl("https://oldwebsite.com");
//
//        Brand updatedBrand = new Brand();
//        updatedBrand.setId(brandId);
//        updatedBrand.setBrandWebsiteUrl("https://existingwebsite.com");
//
//        when(brandRepository.findById(brandId)).thenReturn(Optional.of(existingBrand));
//
//        when(brandRepository.existsByBrandWebsiteUrl(updatedBrand.getBrandWebsiteUrl())).thenReturn(false);
//
//        // Kiem tra
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.updateBrand(updatedBrand));
//        assertEquals("Brand name cannot be null or empty", exception.getMessage());
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(brandRepository, never()).save(any());
//    }
//
//    @Test
//    void deleteBrand_ReturnsTrue() {
//        // Khoi tao
//        int brandId = 1;
//        Brand brand = new Brand();
//        brand.setId(brandId);
//        when(brandRepository.findById(brandId)).thenReturn(Optional.of(brand));
//        when(productRepository.existsByBrand(brand)).thenReturn(false);
//        doNothing().when(brandRepository).delete(brand);
//
//        // Gan du lieu
//        boolean result = brandService.deleteBrand(brandId);
//
//        // Kiem tra
//        assertTrue(result);
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(productRepository, times(1)).existsByBrand(brand);
//        verify(brandRepository, times(1)).delete(brand);
//    }
//
//    @Test
//    void deleteBrand_ReturnsFalse() {
//        // Khoi tao
//        int brandId = 1;
//        when(brandRepository.findById(brandId)).thenReturn(Optional.empty());
//
//        // Gan du lieu
//        boolean result = brandService.deleteBrand(brandId);
//
//        // Kiem tra
//        assertFalse(result);
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(productRepository, never()).existsByBrand(any());
//        verify(brandRepository, never()).delete(any());
//    }
//
//    @Test
//    void deleteBrand_BrandHasProducts_ThrowsRuntimeException() {
//        // Khoi tao
//        int brandId = 1;
//        Brand brand = new Brand();
//        brand.setId(brandId);
//        when(brandRepository.findById(brandId)).thenReturn(Optional.of(brand));
//        when(productRepository.existsByBrand(brand)).thenReturn(true);
//
//        // Kiem tra
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.deleteBrand(brandId));
//        assertEquals("Cannot delete brand because it has linked products.", exception.getMessage());
//        verify(brandRepository, times(1)).findById(brandId);
//        verify(productRepository, times(1)).existsByBrand(brand);
//        verify(brandRepository, never()).delete(any());
//    }
//
//    @Test
//    void getAllBrandsWithQuantity_ReturnsListBrand() {
//        // Khoi tao
//        Object[] result1 = new Object[]{1, "Brand 1", "Description 1", "image1.jpg", "https://brand1.com", Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), 10L};
//        Object[] result2 = new Object[]{2, "Brand 2", "Description 2", "image2.jpg", "https://brand2.com", Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), 5L};
//        List<Object[]> results = Arrays.asList(result1, result2);
//        when(brandRepository.findAllBrandsWithQuantity()).thenReturn(results);
//
//        // Gan du lieu
//        List<BrandDTO> brandDTOs = brandService.getAllBrandsWithQuantity();
//
//        // Kiem tra
//        assertEquals(2, brandDTOs.size());
//        assertEquals(1, brandDTOs.get(0).getBrandId());
//        assertEquals("Brand 1", brandDTOs.get(0).getBrandName());
//        assertEquals(10L, brandDTOs.get(0).getTotalQuantity());
//        assertEquals(2, brandDTOs.get(1).getBrandId());
//        assertEquals("Brand 2", brandDTOs.get(1).getBrandName());
//        assertEquals(5L, brandDTOs.get(1).getTotalQuantity());
//        verify(brandRepository, times(1)).findAllBrandsWithQuantity();
//    }
//
//    @Test
//    void getAllBrandsWithQuantity_ReturnsEmptyListBrand() {
//        // Khoi tao
//        when(brandRepository.findAllBrandsWithQuantity()).thenReturn(Collections.emptyList());
//
//        // Gan du lieu
//        List<BrandDTO> brandDTOs = brandService.getAllBrandsWithQuantity();
//
//        // Kiem tra
//        assertTrue(brandDTOs.isEmpty());
//        verify(brandRepository, times(1)).findAllBrandsWithQuantity();
//    }
//
//    @Test
//    void toOffsetDateTime_TimestampInput_ReturnsOffsetDateTime() {
//        // Khoi tao
//        Timestamp timestamp = Timestamp.from(Instant.now());
//
//        // Gan du lieu
//        OffsetDateTime result = brandService.toOffsetDateTime(timestamp);
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
//        OffsetDateTime result = brandService.toOffsetDateTime(instant);
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
//        OffsetDateTime result = brandService.toOffsetDateTime(offsetDateTime);
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
//        OffsetDateTime result = brandService.toOffsetDateTime(nullInput);
//
//        // Kiem tra
//        assertNull(result);
//    }
//}
