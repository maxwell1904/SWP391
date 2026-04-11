//package com.unleashed.Service;
//
//import com.unleashed.entity.Provider;
//import com.unleashed.repo.ProviderRepository;
//import com.unleashed.repo.TransactionRepository;
//import com.unleashed.repo.UserRepository;
//import com.unleashed.service.ProviderService;
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
//public class ProviderServiceTest {
//
//    @Autowired
//    private ProviderService providerService;
//
//    @MockBean
//    private ProviderRepository providerRepository;
//
//    @MockBean
//    private TransactionRepository transactionRepository;
//
//    @MockBean
//    private UserRepository userRepository;
//
//    private List<Provider> providers;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//        providers = Arrays.asList(
//                createProvider(1, "Provider 1", "image1.jpg", "provider1@example.com", "123-456-7890", "Address 1"),
//                createProvider(2, "Provider 2", "image2.jpg", "provider2@example.com", "987-654-3210", "Address 2")
//        );
//    }
//
//    @Test
//    void getAllProviders_ShouldReturnAllProviders() {
//        when(providerRepository.findAll()).thenReturn(providers);
//
//        List<Provider> result = providerService.getAllProviders();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals("Provider 1", result.get(0).getProviderName());
//        assertEquals("Provider 2", result.get(1).getProviderName());
//        verify(providerRepository, times(1)).findAll();
//    }
//
//    @Test
//    void getAllProviders_NoProviders_ShouldReturnEmptyList() {
//        when(providerRepository.findAll()).thenReturn(Collections.emptyList());
//
//        List<Provider> result = providerService.getAllProviders();
//
//        assertNotNull(result);
//        assertTrue(result.isEmpty());
//        verify(providerRepository, times(1)).findAll();
//    }
//
//    @Test
//    void findById_ExistingId_ShouldReturnProvider() {
//        when(providerRepository.findById(1)).thenReturn(Optional.of(providers.get(0)));
//
//        Provider result = providerService.findById(1);
//
//        assertNotNull(result);
//        assertEquals("Provider 1", result.getProviderName());
//        verify(providerRepository, times(1)).findById(1);
//    }
//
//    @Test
//    void findById_NonExistingId_ShouldReturnNull() {
//        when(providerRepository.findById(100)).thenReturn(Optional.empty());
//
//        Provider result = providerService.findById(100);
//
//        assertNull(result);
//        verify(providerRepository, times(1)).findById(100);
//    }
//
//    @Test
//    void createProvider_ValidProvider_ShouldReturnCreatedProvider() {
//        Provider providerToCreate = createProvider(null, "New Provider", "new_image.jpg", "newprovider@example.com", "111-222-3333", "New Address");
//        when(providerRepository.existsByProviderEmail("newprovider@example.com")).thenReturn(false);
//        when(userRepository.existsByUserEmail("newprovider@example.com")).thenReturn(false);
//        when(providerRepository.existsByProviderPhone("111-222-3333")).thenReturn(false);
//        when(userRepository.existsByUserPhone("111-222-3333")).thenReturn(false);
//        when(providerRepository.save(any(Provider.class))).thenReturn(providerToCreate);
//
//        Provider createdProvider = providerService.createProvider(providerToCreate);
//
//        assertNotNull(createdProvider);
//        assertEquals("New Provider", createdProvider.getProviderName());
//        verify(providerRepository, times(1)).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_EmptyProviderName_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "", "image.jpg", "provider@example.com", "123-123-1234", "Address");
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Provider name cannot be empty", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_EmptyProviderImageUrl_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "", "provider@example.com", "123-123-1234", "Address");
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Provider image URL cannot be empty", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_EmptyProviderEmail_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "", "123-123-1234", "Address");
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Provider email cannot be empty", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_EmptyProviderPhone_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "provider@example.com", "", "Address");
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Provider phone cannot be empty", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_EmptyProviderAddress_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "provider@example.com", "123-123-1234", "");
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Provider address cannot be empty", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_ExistingEmail_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "existing@example.com", "123-123-1234", "Address");
//        when(providerRepository.existsByProviderEmail("existing@example.com")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Email already exists!", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_ExistingUserEmail_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "existing@example.com", "123-123-1234", "Address");
//        when(providerRepository.existsByProviderEmail("existing@example.com")).thenReturn(false);
//        when(userRepository.existsByUserEmail("existing@example.com")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Email already exists!", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_ExistingPhone_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "provider@example.com", "123-123-1234", "Address");
//        when(providerRepository.existsByProviderEmail("provider@example.com")).thenReturn(false);
//        when(userRepository.existsByUserEmail("provider@example.com")).thenReturn(false);
//        when(providerRepository.existsByProviderPhone("123-123-1234")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Phone number already exists!", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void createProvider_ExistingUserPhone_ShouldThrowException() {
//        Provider providerToCreate = createProvider(null, "Provider", "image.jpg", "provider@example.com", "123-123-1234", "Address");
//        when(providerRepository.existsByProviderEmail("provider@example.com")).thenReturn(false);
//        when(userRepository.existsByUserEmail("provider@example.com")).thenReturn(false);
//        when(providerRepository.existsByProviderPhone("123-123-1234")).thenReturn(false);
//        when(userRepository.existsByUserPhone("123-123-1234")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.createProvider(providerToCreate));
//        assertEquals("Phone number already exists!", exception.getMessage());
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_ExistingProvider_ShouldReturnUpdatedProvider() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "updatedprovider@example.com", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//        when(providerRepository.existsByProviderEmail("updatedprovider@example.com")).thenReturn(false);
//        when(userRepository.existsByUserEmail("updatedprovider@example.com")).thenReturn(false);
//        when(providerRepository.existsByProviderPhone("444-555-6666")).thenReturn(false);
//        when(userRepository.existsByUserPhone("444-555-6666")).thenReturn(false);
//        when(providerRepository.save(any(Provider.class))).thenReturn(updatedProvider);
//
//        Provider resultProvider = providerService.updateProvider(updatedProvider);
//
//        assertNotNull(resultProvider);
//        assertEquals("Updated Provider", resultProvider.getProviderName());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, times(1)).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_NonExistingProvider_ShouldThrowException() {
//        Provider updatedProvider = createProvider(100, "Updated Provider", "updated_image.jpg", "updatedprovider@example.com", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(100)).thenReturn(Optional.empty());
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Provider not found with id: 100\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(100);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_EmptyProviderName_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "", "updated_image.jpg", "updatedprovider@example.com", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Provider name cannot be empty\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_EmptyProviderImageUrl_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "", "updatedprovider@example.com", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Provider image URL cannot be empty\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_EmptyProviderEmail_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Provider email cannot be empty\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_EmptyProviderPhone_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "updatedprovider@example.com", "", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Provider phone cannot be empty\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_EmptyProviderAddress_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "updatedprovider@example.com", "444-555-6666", "");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Provider address cannot be empty\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_ExistingEmail_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "existing@example.com", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//        when(providerRepository.existsByProviderEmail("existing@example.com")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Email already exists!\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_ExistingUserEmail_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "existing@example.com", "444-555-6666", "Updated Address");
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//        when(providerRepository.existsByProviderEmail("existing@example.com")).thenReturn(false);
//        when(userRepository.existsByUserEmail("existing@example.com")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Email already exists!\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_ExistingPhone_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "updatedprovider@example.com", "123-456-7891", "Updated Address"); // Same phone as existing provider 1
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//        when(providerRepository.existsByProviderPhone("123-456-7891")).thenReturn(true);
//        when(userRepository.existsByUserPhone("123-456-7891")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Phone number already exists!\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//    @Test
//    void updateProvider_ExistingUserPhone_ShouldThrowException() {
//        Provider existingProvider = providers.get(0);
//        Provider updatedProvider = createProvider(1, "Updated Provider", "updated_image.jpg", "updatedprovider@example.com", "123-456-7891", "Updated Address"); // Same phone as existing provider 1
//        when(providerRepository.findById(1)).thenReturn(Optional.of(existingProvider));
//        when(providerRepository.existsByProviderPhone("123-456-7891")).thenReturn(false);
//        when(userRepository.existsByUserPhone("123-456-7891")).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.updateProvider(updatedProvider));
//        assertEquals("400 BAD_REQUEST \"Phone number already exists!\"", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(providerRepository, never()).save(any(Provider.class));
//    }
//
//
//    @Test
//    void deleteProvider_ExistingProviderNoTransactions_ShouldReturnTrue() {
//        Provider providerToDelete = providers.get(0);
//        when(providerRepository.findById(1)).thenReturn(Optional.of(providerToDelete));
//        when(transactionRepository.existsByProvider(providerToDelete)).thenReturn(false);
//        doNothing().when(providerRepository).delete(providerToDelete);
//
//        boolean deleted = providerService.deleteProvider(1);
//
//        assertTrue(deleted);
//        verify(providerRepository, times(1)).findById(1);
//        verify(transactionRepository, times(1)).existsByProvider(providerToDelete);
//        verify(providerRepository, times(1)).delete(providerToDelete);
//    }
//
//    @Test
//    void deleteProvider_NonExistingProvider_ShouldThrowException() {
//        when(providerRepository.findById(100)).thenReturn(Optional.empty());
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.deleteProvider(100));
//        assertEquals("Provider with ID 100 not found.", exception.getMessage());
//        verify(providerRepository, times(1)).findById(100);
//        verify(transactionRepository, never()).existsByProvider(any());
//        verify(providerRepository, never()).delete(any());
//    }
//
//    @Test
//    void deleteProvider_ExistingProviderWithTransactions_ShouldThrowException() {
//        Provider providerToDelete = providers.get(0);
//        when(providerRepository.findById(1)).thenReturn(Optional.of(providerToDelete));
//        when(transactionRepository.existsByProvider(providerToDelete)).thenReturn(true);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> providerService.deleteProvider(1));
//        assertEquals("Cannot delete provider because it has linked transactions.", exception.getMessage());
//        verify(providerRepository, times(1)).findById(1);
//        verify(transactionRepository, times(1)).existsByProvider(providerToDelete);
//        verify(providerRepository, never()).delete(any());
//    }
//
//    // Helper methods to create mock entities
//    private Provider createProvider(Integer id, String name, String imageUrl, String email, String phone, String address) {
//        Provider provider = new Provider();
//        provider.setId(id);
//        provider.setProviderName(name);
//        provider.setProviderImageUrl(imageUrl);
//        provider.setProviderEmail(email);
//        provider.setProviderPhone(phone);
//        provider.setProviderAddress(address);
//        return provider;
//    }
//}