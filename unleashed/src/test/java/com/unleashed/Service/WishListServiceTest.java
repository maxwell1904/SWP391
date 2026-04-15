//package com.unleashed.Service;
//
//import com.unleashed.dto.WishlistDTO;
//import com.unleashed.entity.User;
//import com.unleashed.entity.Wishlist;
//import com.unleashed.entity.ComposeKey.WishlistId;
//import com.unleashed.repo.WishlistRepository;
//import com.unleashed.repo.UserRepository;
//import com.unleashed.service.WishlistService;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//
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
//public class WishListServiceTest {
//
//    @Autowired
//    private WishlistService wishlistService;
//
//    @MockBean
//    private WishlistRepository wishlistRepository;
//
//    @MockBean
//    private UserRepository userRepository;
//
//    private User testUser;
//    private List<WishlistDTO> wishlistDTOs;
//    private Wishlist wishlist;
//    private WishlistId wishlistId;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        testUser = createUser("testUser", "testUserId");
//        wishlistId = createWishlistId("testUserId", "product1");
//        wishlist = createWishlist(wishlistId);
//        wishlistDTOs = Arrays.asList(createWishlistDTO("product1", "Product 1")); // Ví dụ WishlistDTO, cần điều chỉnh theo cấu trúc thực tế
//
//    }
//
//    @Test
//    void getWishlistByUser_ExistingUser_ShouldReturnWishlistDTOList() {
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(testUser));
//        when(wishlistRepository.findWishlistByUserId("testUserId")).thenReturn(wishlistDTOs);
//
//        List<WishlistDTO> result = wishlistService.getWishlistByUser("testUser");
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals("Product 1", result.get(0).getProductName()); // Giả sử WishlistDTO có getProductName()
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(wishlistRepository, times(1)).findWishlistByUserId("testUserId");
//    }
//
//    @Test
//    void getWishlistByUser_NonExistingUser_ShouldThrowException() {
//        when(userRepository.findByUserUsername("nonExistingUser")).thenReturn(Optional.empty());
//
//        assertThrows(IllegalArgumentException.class, () -> wishlistService.getWishlistByUser("nonExistingUser"));
//
//        verify(userRepository, times(1)).findByUserUsername("nonExistingUser");
//        verify(wishlistRepository, never()).findWishlistByUserId(anyString());
//    }
//
//    @Test
//    void getWishlistByUser_UserWithNoWishlist_ShouldReturnEmptyList() {
//        User userWithoutWishlist = createUser("userNoWishlist", "userNoWishlistId");
//        when(userRepository.findByUserUsername("userNoWishlist")).thenReturn(Optional.of(userWithoutWishlist));
//        when(wishlistRepository.findWishlistByUserId("userNoWishlistId")).thenReturn(Collections.emptyList());
//
//        List<WishlistDTO> result = wishlistService.getWishlistByUser("userNoWishlist");
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(userRepository, times(1)).findByUserUsername("userNoWishlist");
//        verify(wishlistRepository, times(1)).findWishlistByUserId("userNoWishlistId");
//    }
//
//    @Test
//    void addToWishlist_ExistingUser_ShouldReturnWishlist() {
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(testUser));
//        when(wishlistRepository.save(any(Wishlist.class))).thenReturn(wishlist);
//
//        Wishlist result = wishlistService.addToWishlist("testUser", "product1");
//
//        assertNotNull(result);
//        assertEquals(wishlistId, result.getId());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(wishlistRepository, times(1)).save(any(Wishlist.class));
//    }
//
//    @Test
//    void addToWishlist_NonExistingUser_ShouldThrowException() {
//        when(userRepository.findByUserUsername("nonExistingUser")).thenReturn(Optional.empty());
//
//        assertThrows(IllegalArgumentException.class, () -> wishlistService.addToWishlist("nonExistingUser", "product1"));
//
//        verify(userRepository, times(1)).findByUserUsername("nonExistingUser");
//        verify(wishlistRepository, never()).save(any(Wishlist.class));
//    }
//
//    @Test
//    void removeFromWishlist_ExistingUserAndProduct_ShouldDeleteWishlist() {
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(testUser));
//        doNothing().when(wishlistRepository).deleteById(wishlistId);
//
//        wishlistService.removeFromWishlist("testUser", "product1");
//
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(wishlistRepository, times(1)).deleteById(wishlistId);
//    }
//
//    @Test
//    void removeFromWishlist_NonExistingUser_ShouldThrowException() {
//        when(userRepository.findByUserUsername("nonExistingUser")).thenReturn(Optional.empty());
//
//        assertThrows(IllegalArgumentException.class, () -> wishlistService.removeFromWishlist("nonExistingUser", "product1"));
//
//        verify(userRepository, times(1)).findByUserUsername("nonExistingUser");
//        verify(wishlistRepository, never()).deleteById(any(WishlistId.class));
//    }
//
//    @Test
//    void isProductInWishlist_ProductInWishlist_ShouldReturnTrue() {
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(testUser));
//        when(wishlistRepository.existsById(wishlistId)).thenReturn(true);
//
//        boolean result = wishlistService.isProductInWishlist("testUser", "product1");
//
//        assertTrue(result);
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(wishlistRepository, times(1)).existsById(wishlistId);
//    }
//
//    @Test
//    void isProductInWishlist_ProductNotInWishlist_ShouldReturnFalse() {
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(testUser));
//        when(wishlistRepository.existsById(wishlistId)).thenReturn(false);
//
//        boolean result = wishlistService.isProductInWishlist("testUser", "product1");
//
//        assertFalse(result);
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(wishlistRepository, times(1)).existsById(wishlistId);
//    }
//
//    @Test
//    void isProductInWishlist_NonExistingUser_ShouldThrowException() {
//        when(userRepository.findByUserUsername("nonExistingUser")).thenReturn(Optional.empty());
//
//        assertThrows(IllegalArgumentException.class, () -> wishlistService.isProductInWishlist("nonExistingUser", "product1"));
//
//        verify(userRepository, times(1)).findByUserUsername("nonExistingUser");
//        verify(wishlistRepository, never()).existsById(any(WishlistId.class));
//    }
//
//
//    // Helper methods to create mock entities
//    private User createUser(String username, String userId) {
//        User user = new User();
//        user.setUserUsername(username);
//        user.setUserId(userId);
//        return user;
//    }
//
//    private WishlistId createWishlistId(String userId, String productId) {
//        WishlistId wishlistId = new WishlistId();
//        wishlistId.setUserId(userId);
//        wishlistId.setProductId(productId);
//        return wishlistId;
//    }
//
//    private Wishlist createWishlist(WishlistId wishlistId) {
//        Wishlist wishlist = new Wishlist();
//        wishlist.setId(wishlistId);
//        return wishlist;
//    }
//
//    private WishlistDTO createWishlistDTO(String productId, String productName) {
//        WishlistDTO dto = new WishlistDTO();
//        dto.setProductId(productId);
//        dto.setProductName(productName); // Giả sử WishlistDTO có setter/getter cho productName
//        // Set các thuộc tính khác của WishlistDTO nếu cần
//        return dto;
//    }
//}