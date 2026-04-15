//package com.unleashed.Service;
//
//import com.unleashed.dto.CartDTO;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.CartId;
//import com.unleashed.entity.ComposeKey.StockVariationId;
//import com.unleashed.repo.*;
//import com.unleashed.service.CartService;
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
//import org.springframework.util.LinkedMultiValueMap;
//
//import java.math.BigDecimal;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class CartServiceTest {
//
//    @Autowired
//    private CartService cartService;
//
//    @MockBean
//    private CartRepository cartRepository;
//
//    @MockBean
//    private ProductRepository productRepository;
//
//    @MockBean
//    private VariationRepository variationRepository;
//
//    @MockBean
//    private StockVariationRepository stockVariationRepository;
//
//    @MockBean
//    private SaleRepository saleRepository;
//
//    private List<Cart> carts;
//    private Variation variation1;
//    private Variation variation2;
//    private Product product1;
//    private Product product2;
//    private StockVariation stockVariation1;
//    private StockVariation stockVariation2;
//    private Sale sale1;
//    private Sale sale2;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        product1 = createProduct("product_uuid_1", "Product 1");
//        product2 = createProduct("product_uuid_2", "Product 2");
//
//        variation1 = createVariation(1, product1);
//        variation2 = createVariation(2, product2);
//
//        stockVariation1 = createStockVariation(10, variation1);
//        stockVariation2 = createStockVariation(5, variation2);
//
//        sale1 = createSale(1, 10, product1);
//        sale2 = createSale(2, 20, product2);
//
//
//        carts = Arrays.asList(
//                createCart("user1", 1, 2),
//                createCart("user1", 2, 1)
//        );
//    }
//
//    @Test
//    void getCartByUserId_ShouldReturnCartDTOListGroupedByProductName() {
//        String userId = "user1";
//        when(cartRepository.findAllById_UserId(userId)).thenReturn(carts);
//        when(variationRepository.findById(1)).thenReturn(Optional.of(variation1));
//        when(variationRepository.findById(2)).thenReturn(Optional.of(variation2));
//        when(stockVariationRepository.findStockProductByProductVariationId(1)).thenReturn(stockVariation1.getStockQuantity());
//        when(stockVariationRepository.findStockProductByProductVariationId(2)).thenReturn(stockVariation2.getStockQuantity());
//        when(saleRepository.findSaleByProductId(product1.getProductId())).thenReturn(Optional.of(sale1));
//        when(saleRepository.findSaleByProductId(product2.getProductId())).thenReturn(Optional.of(sale2));
//
//
//        LinkedMultiValueMap<String, CartDTO> result = cartService.getCartByUserId(userId);
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertTrue(result.containsKey("Product 1"));
//        assertTrue(result.containsKey("Product 2"));
//        assertEquals(1, result.get("Product 1").size());
//        assertEquals(1, result.get("Product 2").size());
//
//        CartDTO cartDTO1 = result.get("Product 1").get(0);
//        assertEquals(variation1, cartDTO1.getVariation());
//        assertEquals(2, cartDTO1.getQuantity());
//        assertEquals(stockVariation1.getStockQuantity(), cartDTO1.getStockQuantity());
//        assertEquals(sale1, cartDTO1.getSale());
//
//        CartDTO cartDTO2 = result.get("Product 2").get(0);
//        assertEquals(variation2, cartDTO2.getVariation());
//        assertEquals(1, cartDTO2.getQuantity());
//        assertEquals(stockVariation2.getStockQuantity(), cartDTO2.getStockQuantity());
//        assertEquals(sale2, cartDTO2.getSale());
//
//        verify(cartRepository, times(1)).findAllById_UserId(userId);
//        verify(variationRepository, times(2)).findById(anyInt());
//        verify(stockVariationRepository, times(2)).findStockProductByProductVariationId(anyInt());
//        verify(saleRepository, times(2)).findSaleByProductId(anyString());
//    }
//
//    @Test
//    void getCartByUserId_NoCartItems_ShouldReturnEmptyMap() {
//        String userId = "user2";
//        when(cartRepository.findAllById_UserId(userId)).thenReturn(Collections.emptyList());
//
//        LinkedMultiValueMap<String, CartDTO> result = cartService.getCartByUserId(userId);
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(cartRepository, times(1)).findAllById_UserId(userId);
//        verify(variationRepository, never()).findById(anyInt());
//        verify(stockVariationRepository, never()).findStockProductByProductVariationId(anyInt());
//        verify(saleRepository, never()).findSaleByProductId(anyString());
//    }
//
//    @Test
//    void addToCart_NewItem_ShouldCreateNewCartItem() {
//        String userId = "user2";
//        Integer variationId = 3;
//        Integer quantity = 3;
//        CartId cartId = CartId.builder().userId(userId).variationId(variationId).build();
//        when(cartRepository.findById(cartId)).thenReturn(Optional.empty());
//        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        cartService.addToCart(userId, variationId, quantity);
//
//        verify(cartRepository, times(1)).findById(cartId);
//        verify(cartRepository, times(1)).save(any(Cart.class));
//    }
//
//    @Test
//    void addToCart_ExistingItem_ShouldUpdateQuantity() {
//        String userId = "user1";
//        Integer variationId = 1;
//        Integer quantityToAdd = 2;
//        CartId cartId = CartId.builder().userId(userId).variationId(variationId).build();
//        Cart existingCart = createCart(userId, variationId, 2);
//        when(cartRepository.findById(cartId)).thenReturn(Optional.of(existingCart));
//        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        cartService.addToCart(userId, variationId, quantityToAdd);
//
//        assertEquals(4, existingCart.getCartQuantity());
//        verify(cartRepository, times(1)).findById(cartId);
//        verify(cartRepository, times(1)).save(any(Cart.class));
//    }
//
//    @Test
//    void removeFromCart_ExistingItem_ShouldDeleteCartItem() {
//        String userId = "user1";
//        Integer variationId = 1;
//        CartId cartId = CartId.builder().userId(userId).variationId(variationId).build();
//        Cart existingCart = createCart(userId, variationId, 2);
//        when(cartRepository.findById(cartId)).thenReturn(Optional.of(existingCart));
//        doNothing().when(cartRepository).delete(existingCart);
//
//        cartService.removeFromCart(userId, variationId);
//
//        verify(cartRepository, times(1)).findById(cartId);
//        verify(cartRepository, times(1)).delete(existingCart);
//    }
//
//    @Test
//    void removeFromCart_NonExistingItem_ShouldThrowException() {
//        String userId = "user2";
//        Integer variationId = 3;
//        CartId cartId = CartId.builder().userId(userId).variationId(variationId).build();
//        when(cartRepository.findById(cartId)).thenReturn(Optional.empty());
//
//        assertThrows(NullPointerException.class, () -> cartService.removeFromCart(userId, variationId));
//
//        verify(cartRepository, times(1)).findById(cartId);
//        verify(cartRepository, never()).delete(any());
//    }
//
//    @Test
//    void removeAllFromCart_ExistingItems_ShouldDeleteAllCartItemsForUser() {
//        String userId = "user1";
//        when(cartRepository.findAllById_UserId(userId)).thenReturn(carts);
//        doNothing().when(cartRepository).deleteAllById_UserId(userId);
//
//        cartService.removeAllFromCart(userId);
//
//        verify(cartRepository, times(1)).findAllById_UserId(userId);
//        verify(cartRepository, times(1)).deleteAllById_UserId(userId);
//    }
//
//    @Test
//    void removeAllFromCart_NoItems_ShouldThrowException() {
//        String userId = "user2";
//        when(cartRepository.findAllById_UserId(userId)).thenReturn(Collections.emptyList());
//
//        assertThrows(NullPointerException.class, () -> cartService.removeAllFromCart(userId));
//
//        verify(cartRepository, times(1)).findAllById_UserId(userId);
//        verify(cartRepository, never()).deleteAllById_UserId(anyString());
//    }
//
//
//    // Helper methods to create mock entities
//    private Cart createCart(String userId, Integer variationId, Integer quantity) {
//        CartId cartId = CartId.builder().userId(userId).variationId(variationId).build();
//        return Cart.builder()
//                .id(cartId)
//                .cartQuantity(quantity)
//                .build();
//    }
//
//    private Product createProduct(String productId, String productName) {
//        Product product = new Product();
//        product.setProductId(productId);
//        product.setProductName(productName);
//        return product;
//    }
//
//    private Variation createVariation(Integer variationId, Product product) {
//        Variation variation = Variation.builder()
//                .id(variationId)
//                .product(product)
//                .variationPrice(BigDecimal.TEN) // Add default price if needed for tests
//                .build();
//        return variation;
//    }
//
//    private StockVariation createStockVariation(Integer stockQuantity, Variation variation) {
//        StockVariationId stockVariationId = new StockVariationId();
//        stockVariationId.setVariationId(variation.getId());
//
//        StockVariation stockVariation = new StockVariation();
//        stockVariation.setId(stockVariationId);
//        stockVariation.setStockQuantity(stockQuantity);
//        return stockVariation;
//    }
//
//    private Sale createSale(Integer saleId, Integer discountPercent, Product product) {
//        Sale sale = new Sale();
//        sale.setId(saleId);
//        sale.setSaleValue(BigDecimal.valueOf(discountPercent).divide(BigDecimal.valueOf(100))); // Assuming saleValue is a fraction
//        return sale;
//    }
//}