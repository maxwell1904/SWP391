//package com.unleashed.Service;
//
//import com.unleashed.dto.*;
//import com.unleashed.dto.mapper.ProductMapper;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.SaleProductId;
//import com.unleashed.entity.ComposeKey.StockVariationId;
//import com.unleashed.repo.*;
//import com.unleashed.service.ProductService;
//import com.unleashed.service.ReviewService;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.Pageable;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//import static org.springframework.data.mapping.Alias.ofNullable;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//public class ProductServiceTest {
//
//    @Autowired
//    private ProductService productService;
//
//    @MockBean
//    private ProductRepository productRepository;
//    @MockBean
//    private BrandRepository brandRepository;
//    @MockBean
//    private CategoryRepository categoryRepository;
//    @MockBean
//    private VariationRepository variationRepository;
//    @MockBean
//    private SizeRepository sizeRepository;
//    @MockBean
//    private ColorRepository colorRepository;
//    @MockBean
//    private SaleProductRepository saleProductRepository;
//    @MockBean
//    private ReviewRepository reviewRepository;
//    @MockBean
//    private StockVariationRepository stockVariationRepository;
//    @MockBean
//    private ProductStatusRepository productStatusRepository;
//    @MockBean
//    private SaleRepository saleRepository;
//    @MockBean
//    private ProductMapper productMapper;
//    @MockBean
//    private ReviewService reviewService;
//
//    private List<Product> products;
//    private Brand brand1;
//    private Brand brand2;
//    private Category category1;
//    private Category category2;
//    private ProductStatus productStatusActive;
//    private ProductStatus productStatusInactive;
//    private Variation variation1;
//    private Variation variation2;
//    private Size size1;
//    private Size size2;
//    private Color color1;
//    private Color color2;
//    private Sale sale1;
//    private Sale sale2;
//    private SaleProduct saleProduct1;
//    private StockVariation stockVariation1;
//    private StockVariation stockVariation2;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        brand1 = createBrand(1, "Brand 1");
//        brand2 = createBrand(2, "Brand 2");
//        category1 = createCategory(1, "Category 1");
//        category2 = createCategory(2, "Category 2");
//        productStatusActive = createProductStatus(1, "ACTIVE");
//        productStatusInactive = createProductStatus(2, "INACTIVE");
//
//        products = Arrays.asList(
//                createProduct("product_uuid_1", "Product 1", "Description 1", brand1, productStatusActive),
//                createProduct("product_uuid_2", "Product 2", "Description 2", brand2, productStatusInactive)
//        );
//
//        size1 = createSize(1, "S");
//        size2 = createSize(2, "M");
//        color1 = createColor(1, "Red");
//        color2 = createColor(2, "Blue");
//
//        variation1 = createVariation(1, products.get(0), size1, color1, BigDecimal.TEN, "image1.jpg");
//        variation2 = createVariation(2, products.get(1), size2, color2, BigDecimal.valueOf(20), "image2.jpg");
//
//        stockVariation1 = createStockVariation(10, variation1);
//        stockVariation2 = createStockVariation(5, variation2);
//
//        sale1 = createSale(1, 10);
//        sale2 = createSale(2, 20);
//
//        saleProduct1 = createSaleProduct(sale1, products.get(0));
//    }
//
//    @Test
//    void findAll_ShouldReturnAllProducts() {
//        when(productRepository.findAll()).thenReturn(products);
//
//        List<Product> result = productService.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(products.get(0).getProductName(), result.get(0).getProductName());
//        assertEquals(products.get(1).getProductDescription(), result.get(1).getProductDescription());
//        verify(productRepository, times(1)).findAll();
//    }
//
//    @Test
//    void findById_ExistingId_ShouldReturnProduct() {
//        String productId = products.get(0).getProductId();
//        when(productRepository.findById(productId)).thenReturn(Optional.of(products.get(0)));
//
//        Product result = productService.findById(productId);
//
//        assertNotNull(result);
//        assertEquals(products.get(0).getProductName(), result.getProductName());
//        verify(productRepository, times(1)).findById(productId);
//    }
//
//    @Test
//    void findById_NonExistingId_ShouldReturnNull() {
//        String productId = "non_existing_uuid";
//        when(productRepository.findById(productId)).thenReturn(Optional.empty());
//
//        Product result = productService.findById(productId);
//
//        assertNull(result);
//        verify(productRepository, times(1)).findById(productId);
//    }
//
//    @Test
//    void findProductItemById_ExistingId_ShouldReturnProductItemDTO() {
//        String productId = products.get(0).getProductId();
//        when(productRepository.findById(productId)).thenReturn(Optional.of(products.get(0)));
//        when(saleProductRepository.findSaleProductByProductId(productId)).thenReturn(saleProduct1);
//        when(saleRepository.findById(saleProduct1.getId().getSaleId())).thenReturn(Optional.of(sale1));
//        when(saleRepository.findSaleByProductId(productId)).thenReturn(Optional.of(sale1));
//        when(reviewService.getAllReviewsByProductId(productId)).thenReturn(Collections.emptyList());
//        when(reviewRepository.countAndAvgRatingByProductId(productId)).thenReturn(Collections.emptyList());
//        when(variationRepository.findProductVariationByProductId(productId)).thenReturn(Collections.singletonList(variation1));
//        when(sizeRepository.findAllByProductId(productId)).thenReturn(Collections.singletonList(size1));
//        when(colorRepository.findAllByProductId(productId)).thenReturn(Collections.singletonList(color1));
//        when(stockVariationRepository.findStockProductByProductVariationId(variation1.getId())).thenReturn(stockVariation1.getStockQuantity());
//        when(productStatusRepository.findStatusByProductId(productId)).thenReturn(productStatusActive.getId());
//
//
//        ProductItemDTO result = productService.findProductItemById(productId);
//
//        assertNotNull(result);
//        assertEquals(productId, result.getProductId());
//        assertEquals(products.get(0).getProductName(), result.getProductName());
//        assertNotNull(result.getVariations());
//        assertFalse(result.getVariations().isEmpty());
//        assertTrue(result.getVariations().containsKey(color1.getColorName()));
//        assertTrue(result.getVariations().get(color1.getColorName()).containsKey(size1.getSizeName()));
//        assertEquals(productStatusActive.getId(), result.getStatus());
//
//        verify(productRepository, times(1)).findById(productId);
//        verify(saleProductRepository, times(1)).findSaleProductByProductId(productId);
//        verify(saleRepository, times(1)).findById(anyInt());
//        verify(reviewService, times(1)).getAllReviewsByProductId(productId);
//        verify(reviewRepository, times(1)).countAndAvgRatingByProductId(productId);
//        verify(variationRepository, times(1)).findProductVariationByProductId(productId);
//        verify(sizeRepository, times(1)).findAllByProductId(productId);
//        verify(colorRepository, times(1)).findAllByProductId(productId);
//        verify(stockVariationRepository, times(1)).findStockProductByProductVariationId(variation1.getId());
//        verify(productStatusRepository, times(1)).findStatusByProductId(productId);
//    }
//
////    @Test
////    void findProductItemById_NonExistingId_ShouldReturnNullInDTO() {
////        String productId = "non_existing_uuid";
////        when(productRepository.findById(productId)).thenReturn(Optional.empty());
////
////        ProductItemDTO result = productService.findProductItemById(productId);
////
////        assertNotNull(result); //DTO is still returned, but empty or with default values
////        verify(productRepository, times(1)).findById(productId);
////        verify(saleRepository, never()).findById(anyInt());
////        verify(sizeRepository, never()).findAllByProductId(anyString());
////        verify(colorRepository, never()).findAllByProductId(anyString());
////        verify(stockVariationRepository, never()).findStockProductByProductVariationId(anyInt());
////        verify(productStatusRepository, never()).findStatusByProductId(anyString());
////    }
//
//    @Test
//    void deleteProduct_ExistingId_ShouldSoftDeleteProduct() {
//        String productId = products.get(0).getProductId();
//        doNothing().when(productRepository).softDeleteProduct(productId);
//
//        productService.deleteProduct(productId);
//
//        verify(productRepository, times(1)).softDeleteProduct(productId);
//    }
//
//
//    @Test
//    void addProduct_ValidProductDTO_ShouldAddProductAndVariations() {
//        ProductDTO productDTO = createProductDTO("New Product", "New Description", brand1.getId(), Arrays.asList(category1.getId()),
//                Collections.singletonList(createProductVariationDTO(size1.getId(), color1.getId(), BigDecimal.valueOf(25), "new_image.jpg")));
//        Product savedProduct = createProduct("new_product_uuid", "New Product", "New Description", brand1, productStatusInactive);
//
//        when(productStatusRepository.findById(2)).thenReturn(Optional.of(productStatusInactive));
//        when(brandRepository.findById(productDTO.getBrandId())).thenReturn(Optional.of(brand1));
//        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
//        when(categoryRepository.findById(category1.getId())).thenReturn(Optional.of(category1));
//        when(variationRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll to return empty list (or mock specific behavior if needed)
//
//
//        Product result = productService.addProduct(productDTO);
//
//        assertNotNull(result);
//        assertEquals("New Product", result.getProductName());
//        verify(productStatusRepository, times(1)).findById(2);
//        verify(brandRepository, times(1)).findById(productDTO.getBrandId());
//        verify(productRepository, times(1)).addProductCategory(eq(savedProduct.getProductId()), eq(category1.getId()));
//        verify(variationRepository, times(1)).saveAll(anyList());
//    }
//
//
//    @Test
//    void updateProduct_ExistingProduct_ShouldUpdateProductDetails() {
//        String productId = products.get(0).getProductId();
//        ProductDTO productDTO = createProductDTO("Updated Product Name", "Updated Description", brand2.getId(), Arrays.asList(category2.getId()), Collections.emptyList());
//        Product existingProduct = products.get(0);
//        Product updatedProduct = createProduct(productId, "Updated Product Name", "Updated Description", brand2, productStatusActive);
//        updatedProduct.setCategories(Collections.singletonList(category2));
//
//
//        when(productRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
//        when(brandRepository.findById(productDTO.getBrandId())).thenReturn(Optional.of(brand2));
//        when(categoryRepository.findById(category2.getId())).thenReturn(Optional.of(category2));
//        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
//
//
//        Product result = productService.updateProduct(productDTO, productId);
//
//        assertNotNull(result);
//        assertEquals("Updated Product Name", result.getProductName());
//        assertEquals("Updated Description", result.getProductDescription());
//        assertEquals(brand2, result.getBrand());
//        assertEquals(Collections.singletonList(category2), result.getCategories());
//
//        verify(productRepository, times(1)).findById(productId);
//        verify(brandRepository, times(1)).findById(productDTO.getBrandId());
//        verify(categoryRepository, times(1)).findById(category2.getId());
//        verify(productRepository, times(1)).save(any(Product.class));
//    }
//
//    @Test
//    void updateProduct_NonExistingProduct_ShouldReturnNull() {
//        String productId = "non_existing_uuid";
//        ProductDTO productDTO = createProductDTO("Updated Product Name", "Updated Description", brand2.getId(), Arrays.asList(category2.getId()), Collections.emptyList());
//        when(productRepository.findById(productId)).thenReturn(Optional.empty());
//
//        Product result = productService.updateProduct(productDTO, productId);
//
//        assertNull(result);
//        verify(productRepository, times(1)).findById(productId);
//        verify(brandRepository, never()).findById(anyInt());
//        verify(categoryRepository, never()).findById(anyInt());
//        verify(productRepository, never()).save(any(Product.class));
//    }
//
////    @Test
////    void getListProduct_ShouldReturnListOfProductListDTO() {
////        when(productRepository.findAllActiveProducts()).thenReturn(products);
////        when(variationRepository.findProductVariationByProductId(products.get(0).getProductId())).thenReturn(Collections.singletonList(variation1));
////        when(variationRepository.findProductVariationByProductId(products.get(1).getProductId())).thenReturn(Collections.singletonList(variation2));
////        when(saleProductRepository.findById_ProductId(products.get(0).getProductId())).thenReturn(Collections.singletonList(saleProduct1));
////        when(saleProductRepository.findById_ProductId(products.get(1).getProductId())).thenReturn(Collections.emptyList());
////        when(saleRepository.findById(saleProduct1.getId().getSaleId())).thenReturn(Optional.of(sale1));
////        when(reviewRepository.countAndAvgRatingByProductId(products.get(0).getProductId())).thenReturn(Collections.emptyList());
////        when(reviewRepository.countAndAvgRatingByProductId(products.get(1).getProductId())).thenReturn(Collections.emptyList());
////        when(stockVariationRepository.getTotalStockQuantityForProduct(products.get(0).getProductId())).thenReturn(stockVariation1.getStockQuantity());
////        when(stockVariationRepository.getTotalStockQuantityForProduct(products.get(1).getProductId())).thenReturn(stockVariation2.getStockQuantity());
////
////
////        List<ProductListDTO> result = productService.getListProduct();
////
////        assertNotNull(result);
////        assertEquals(products.get(0).getProductName(), result.get(0).getProductName());
////        assertEquals(products.get(1).getProductName(), result.get(1).getProductName());
////        assertEquals(variation1.getVariationPrice(), result.get(0).getProductPrice());
////        assertEquals(variation2.getVariationImage(), result.get(1).getProductVariationImage());
////        assertEquals(stockVariation1.getStockQuantity(), result.get(0).getQuantity());
////        assertEquals(stockVariation2.getStockQuantity(), result.get(1).getQuantity());
////
////        verify(productRepository, times(1)).findAllActiveProducts();
////        verify(variationRepository, times(2)).findProductVariationByProductId(anyString());
////        verify(saleProductRepository, times(2)).findById_ProductId(anyString());
////        verify(saleRepository, times(1)).findById(anyInt());
////        verify(reviewRepository, times(2)).countAndAvgRatingByProductId(anyString());
////        verify(stockVariationRepository, times(2)).getTotalStockQuantityForProduct(anyString());
////    }
//
//    @Test
//    void addVariationsToExistingProduct_ExistingProduct_ShouldAddVariations() {
//        String productId = products.get(0).getProductId();
//        List<ProductDTO.ProductVariationDTO> variationDTOs = Collections.singletonList(createProductVariationDTO(size2.getId(), color2.getId(), BigDecimal.valueOf(30), "new_variation_image.jpg"));
//        Product existingProduct = products.get(0);
//        existingProduct.setProductVariations(new ArrayList<>(Collections.singletonList(variation1))); // Existing variation
//
//        when(productRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
//        when(sizeRepository.findById(variationDTOs.get(0).getSizeId())).thenReturn(Optional.of(size2));
//        when(colorRepository.findById(variationDTOs.get(0).getColorId())).thenReturn(Optional.of(color2));
//        when(variationRepository.saveAll(anyList())).thenReturn(Collections.emptyList()); // Mock saveAll to return empty list (or mock specific behavior if needed)
//        when(productRepository.save(any(Product.class))).thenReturn(existingProduct);
//
//
//        Product result = productService.addVariationsToExistingProduct(productId, variationDTOs);
//
//        assertNotNull(result);
//        assertEquals(2, result.getProductVariations().size()); // Existing + new variation
//        assertTrue(result.getProductVariations().stream().anyMatch(v -> v.getSize().equals(size2) && v.getColor().equals(color2))); // Check new variation added
//
//        verify(productRepository, times(1)).findById(productId);
//        verify(sizeRepository, times(1)).findById(variationDTOs.get(0).getSizeId());
//        verify(colorRepository, times(1)).findById(variationDTOs.get(0).getColorId());
//        verify(variationRepository, times(1)).saveAll(anyList());
//        verify(productRepository, times(1)).save(any(Product.class));
//    }
//
//    @Test
//    void addVariationsToExistingProduct_NonExistingProduct_ShouldThrowException() {
//        String productId = "non_existing_uuid";
//        List<ProductDTO.ProductVariationDTO> variationDTOs = Collections.singletonList(createProductVariationDTO(size2.getId(), color2.getId(), BigDecimal.valueOf(30), "new_variation_image.jpg"));
//        when(productRepository.findById(productId)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class, () -> productService.addVariationsToExistingProduct(productId, variationDTOs));
//
//        verify(productRepository, times(1)).findById(productId);
//        verify(sizeRepository, never()).findById(anyInt());
//        verify(colorRepository, never()).findById(anyInt());
//        verify(variationRepository, never()).saveAll(anyList());
//        verify(productRepository, never()).save(any(Product.class));
//    }
//
//    @Test
//    void searchProducts_ShouldReturnPageOfProductListDTO() {
//        String query = "Product";
//        Pageable pageable = Pageable.unpaged();
//        Page<Object[]> productPageResult = new PageImpl<>(Collections.singletonList(new Object[]{products.get(0), variation1, 4.5, 10L})); // Mock Page<Object[]>
//
//        when(productRepository.searchProducts(query, pageable)).thenReturn(productPageResult);
//
//        Page<ProductListDTO> resultPage = productService.searchProducts(query, pageable);
//        List<ProductListDTO> resultList = resultPage.getContent();
//
//
//        assertNotNull(resultPage);
//        assertFalse(resultList.isEmpty());
//        assertEquals(1, resultList.size());
//        assertEquals(products.get(0).getProductName(), resultList.get(0).getProductName());
//        assertEquals(variation1.getVariationPrice(), resultList.get(0).getProductPrice());
//        assertEquals(4.5, resultList.get(0).getAverageRating());
//        assertEquals(10L, resultList.get(0).getTotalRatings());
//
//
//        verify(productRepository, times(1)).searchProducts(query, pageable);
//    }
//
//
//    @Test
//    void getProductsInStock_ShouldReturnListOfProductDetailDTOInStockAndNotOnSale() {
//        when(productRepository.findProductsInStock()).thenReturn(products);
//        when(saleProductRepository.findAllProductIdsInSale()).thenReturn(Collections.emptyList());
//
//        List<ProductDetailDTO> result = productService.getProductsInStock();
//
//        assertNotNull(result);
//        assertEquals(2, result.size()); // Assuming both products are in stock in mock data
//        assertEquals(products.get(0).getProductId(), result.get(0).getProductId());
//        assertEquals(products.get(1).getProductName(), result.get(1).getProductName());
//
//        verify(productRepository, times(1)).findProductsInStock();
//        verify(saleProductRepository, times(1)).findAllProductIdsInSale();
//    }
//
//
//    // Helper methods to create mock entities
//    private Product createProduct(String productId, String name, String description, Brand brand, ProductStatus productStatus) {
//        Product product = new Product();
//        product.setProductId(productId);
//        product.setProductName(name);
//        product.setProductDescription(description);
//        product.setBrand(brand);
//        product.setProductStatus(productStatus);
//        product.setProductVariations(new ArrayList<>()); // Initialize variations
//        product.setCategories(new ArrayList<>()); // Initialize categories
//        return product;
//    }
//
//    private Brand createBrand(Integer id, String name) {
//        Brand brand = new Brand();
//        brand.setId(id);
//        brand.setBrandName(name);
//        return brand;
//    }
//
//    private Category createCategory(Integer id, String name) {
//        Category category = new Category();
//        category.setId(id);
//        category.setCategoryName(name);
//        return category;
//    }
//
//    private ProductStatus createProductStatus(Integer id, String name) {
//        ProductStatus productStatus = new ProductStatus();
//        productStatus.setId(id);
//        productStatus.setProductStatusName(name);
//        return productStatus;
//    }
//
//    private Variation createVariation(Integer id, Product product, Size size, Color color, BigDecimal price, String image) {
//        Variation variation = Variation.builder()
//                .id(id)
//                .product(product)
//                .size(size)
//                .color(color)
//                .variationPrice(price)
//                .variationImage(image)
//                .build();
//        return variation;
//    }
//    private Size createSize(Integer id, String name) {
//        Size size = new Size();
//        size.setId(id);
//        size.setSizeName(name);
//        return size;
//    }
//
//    private Color createColor(Integer id, String name) {
//        Color color = new Color();
//        color.setId(id);
//        color.setColorName(name);
//        return color;
//    }
//
//    private Sale createSale(Integer id, Integer discountPercent) {
//        Sale sale = new Sale();
//        sale.setId(id);
//        sale.setSaleValue(BigDecimal.valueOf(discountPercent).divide(BigDecimal.valueOf(100)));
//        return sale;
//    }
//
//    private SaleProduct createSaleProduct(Sale sale, Product product) {
//        SaleProductId saleProductId = new SaleProductId();
//        saleProductId.setProductId(product.getProductId());
//        saleProductId.setSaleId(sale.getId());
//
//        SaleProduct saleProduct = new SaleProduct();
//        saleProduct.setId(saleProductId);
//        return saleProduct;
//    }
//
//    private StockVariation createStockVariation(Integer quantity, Variation variation) {
//        StockVariationId stockVariationId = new StockVariationId();
//        stockVariationId.setVariationId(variation.getId());
//
//        StockVariation stockVariation = new StockVariation();
//        stockVariation.setId(stockVariationId);
//        stockVariation.setStockQuantity(quantity);
//        return stockVariation;
//    }
//
//    private ProductDTO createProductDTO(String productName, String productDescription, Integer brandId, List<Integer> categoryIds, List<ProductDTO.ProductVariationDTO> variationDTOs) {
//        ProductDTO dto = new ProductDTO();
//        dto.setProductName(productName);
//        dto.setProductDescription(productDescription);
//        dto.setBrandId(brandId);
//        dto.setCategoryIdList(categoryIds);
//        dto.setVariations(variationDTOs);
//        return dto;
//    }
//
//    private ProductDTO.ProductVariationDTO createProductVariationDTO(Integer sizeId, Integer colorId, BigDecimal price, String image) {
//        return new ProductDTO.ProductVariationDTO(sizeId, colorId, price, image);
//    }
//}