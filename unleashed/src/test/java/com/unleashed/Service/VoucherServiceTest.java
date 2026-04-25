//package com.unleashed.Service;
//
//import com.unleashed.dto.VoucherDTO;
//import com.unleashed.dto.VoucherUserViewDTO;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.UserVoucherId;
//import com.unleashed.repo.*;
//import com.unleashed.service.VoucherService;
//import com.unleashed.dto.mapper.UserMapper;
//import com.unleashed.util.JwtUtil;
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
//import org.springframework.data.domain.*;
//import org.springframework.data.rest.webmvc.ResourceNotFoundException;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//import java.time.ZoneOffset;
//import java.util.*;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class VoucherServiceTest {
//
//    @Autowired
//    private VoucherService voucherService;
//
//    @MockBean
//    private VoucherRepository voucherRepository;
//
//    @MockBean
//    private UserVoucherRepository userVoucherRepository;
//
//    @MockBean
//    private UserRepository userRepository;
//
//    @MockBean
//    private UserMapper userMapper;
//
//    @MockBean
//    private JwtUtil jwtUtil;
//
//    @MockBean
//    private VoucherStatusRespository voucherStatusRespository;
//
//    @MockBean
//    private VoucherTypeRepository voucherTypeRepository;
//
//    @MockBean
//    private RankRepository rankRepository;
//
//    private Voucher voucher1;
//    private VoucherDTO voucherDTO1;
//    private VoucherStatus voucherStatusActive;
//    private VoucherStatus voucherStatusInactive;
//    private VoucherType voucherTypePercentage;
//    private Rank rankVip;
//    private User user1;
//    @MockBean
//    private UserVoucher userVoucher1;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        voucherStatusActive = new VoucherStatus();
//        voucherStatusActive.setId(1);
//        voucherStatusActive.setVoucherStatusName("ACTIVE");
//
//        voucherStatusInactive = new VoucherStatus();
//        voucherStatusInactive.setId(2);
//        voucherStatusInactive.setVoucherStatusName("INACTIVE");
//
//        voucherTypePercentage = new VoucherType();
//        voucherTypePercentage.setId(1);
//        voucherTypePercentage.setVoucherTypeName("PERCENTAGE");
//
//        rankVip = new Rank();
//        rankVip.setId(1);
//        rankVip.setRankName("VIP");
//
//        voucher1 = new Voucher();
//        voucher1.setVoucherId(1);
//        voucher1.setVoucherCode("VOUCHER10");
//        voucher1.setVoucherType(voucherTypePercentage);
//        voucher1.setVoucherValue(BigDecimal.TEN);
//        voucher1.setVoucherStartDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
//        voucher1.setVoucherEndDate(OffsetDateTime.now(ZoneOffset.UTC).plusDays(7));
//        voucher1.setVoucherStatus(voucherStatusActive);
//        voucher1.setVoucherDescription("Test Voucher 1");
//        voucher1.setVoucherMinimumOrderValue(BigDecimal.valueOf(50));
//        voucher1.setVoucherMaximumValue(BigDecimal.valueOf(20));
//        voucher1.setVoucherUsageLimit(100);
//        voucher1.setVoucherRankRequirement(rankVip);
//        voucher1.setVoucherUsageCount(0);
//        voucher1.setVoucherCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
//        voucher1.setVoucherUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
//
//        voucherDTO1 = new VoucherDTO(
//                voucher1.getVoucherId(),
//                voucher1.getVoucherCode(),
//                voucher1.getVoucherType(),
//                voucher1.getVoucherValue(),
//                voucher1.getVoucherStartDate(),
//                voucher1.getVoucherEndDate(),
//                voucher1.getVoucherStatus(),
//                voucher1.getVoucherDescription(),
//                voucher1.getVoucherMinimumOrderValue(),
//                voucher1.getVoucherMaximumValue(),
//                voucher1.getVoucherUsageLimit(),
//                voucher1.getVoucherRankRequirement(),
//                voucher1.getVoucherUsageCount()
//        );
//
//        user1 = new User();
//        user1.setUserId("user1");
//        user1.setUserUsername("testUser");
//
//        userVoucher1 = new UserVoucher();
//        userVoucher1.setId(new UserVoucherId("user1", 1));
//        userVoucher1.setIsVoucherUsed(false);
//    }
//
//    @Test
//        void isVoucherCodeExists_ExistingCode_ShouldReturnTrue() {
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
//        assertTrue(voucherService.isVoucherCodeExists("VOUCHER10"));
//        verify(voucherRepository, times(1)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void isVoucherCodeExists_NonExistingCode_ShouldReturnFalse() {
//        when(voucherRepository.findByVoucherCode("NONEXIST")).thenReturn(Optional.empty());
//        assertFalse(voucherService.isVoucherCodeExists("NONEXIST"));
//        verify(voucherRepository, times(1)).findByVoucherCode("NONEXIST");
//    }
//
//    @Test
//    void getAllVouchers_ShouldReturnPageOfVoucherDTOs() {
//        Page<Voucher> voucherPage = new PageImpl<>(Collections.singletonList(voucher1));
//        Page<VoucherDTO> voucherDTOPage = new PageImpl<>(Collections.singletonList(voucherDTO1));
//
//        when(voucherRepository.findAll(any(PageRequest.class))).thenReturn(voucherPage);
////        when(voucherService.convertToDTO(voucher1)).thenReturn(voucherDTO1); // Mock convertToDTO in service
//
//        Page<VoucherDTO> resultPage = voucherService.getAllVouchers(0, 10);
//
//        assertNotNull(resultPage);
//        assertEquals(1, resultPage.getContent().size());
//        assertEquals(voucherDTO1.getVoucherCode(), resultPage.getContent().get(0).getVoucherCode());
//        verify(voucherRepository, times(1)).findAll(any(PageRequest.class));
//    }
//
//    @Test
//    void getVoucherById_ExistingId_ShouldReturnVoucherDTO() {
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
////        when(voucherService.convertToDTO(voucher1)).thenReturn(voucherDTO1); // Mock convertToDTO in service
//
//        Optional<VoucherDTO> resultDTOOpt = voucherService.getVoucherById(1);
//
//        assertTrue(resultDTOOpt.isPresent());
//        assertEquals(voucherDTO1.getVoucherCode(), resultDTOOpt.get().getVoucherCode());
//        verify(voucherRepository, times(1)).findById(1);
//    }
//
//    @Test
//    void getVoucherById_NonExistingId_ShouldReturnEmptyOptional() {
//        when(voucherRepository.findById(100)).thenReturn(Optional.empty());
//        Optional<VoucherDTO> resultDTOOpt = voucherService.getVoucherById(100);
//        assertFalse(resultDTOOpt.isPresent());
//        verify(voucherRepository, times(1)).findById(100);
//    }
//
//    @Test
//    void addVoucher_ValidDTO_ShouldReturnVoucherDTO() {
//        when(voucherRepository.save(any(Voucher.class))).thenReturn(voucher1);
////        when(voucherService.convertToDTO(voucher1)).thenReturn(voucherDTO1); // Mock convertToDTO in service
//        when(voucherStatusRespository.findById(voucherStatusActive.getId())).thenReturn(Optional.of(voucherStatusActive));
//        when(voucherTypeRepository.findById(voucherTypePercentage.getId())).thenReturn(Optional.of(voucherTypePercentage));
//        when(rankRepository.findById(rankVip.getId())).thenReturn(Optional.of(rankVip));
//
//        VoucherDTO resultDTO = voucherService.addVoucher(voucherDTO1);
//
//        assertNotNull(resultDTO);
//        assertEquals(voucherDTO1.getVoucherCode(), resultDTO.getVoucherCode());
//        verify(voucherRepository, times(1)).save(any(Voucher.class));
//    }
//
//    @Test
//    void addVoucher_StartDateAfterEndDate_ShouldThrowException() {
//        VoucherDTO invalidDTO = new VoucherDTO();
//        invalidDTO.setStartDate(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1));
//        invalidDTO.setEndDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
//
//        assertThrows(IllegalArgumentException.class, () -> voucherService.addVoucher(invalidDTO));
//        verify(voucherRepository, never()).save(any());
//    }
//
//    @Test
//    void updateVoucher_ExistingId_ShouldReturnUpdatedVoucherDTO() {
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
//        when(voucherRepository.save(any(Voucher.class))).thenReturn(voucher1);
////        when(voucherService.convertToDTO(voucher1)).thenReturn(voucherDTO1); // Mock convertToDTO in service
//        when(voucherStatusRespository.findById(voucherStatusActive.getId())).thenReturn(Optional.of(voucherStatusActive));
//        when(voucherTypeRepository.findById(voucherTypePercentage.getId())).thenReturn(Optional.of(voucherTypePercentage));
//        when(rankRepository.findById(rankVip.getId())).thenReturn(Optional.of(rankVip));
//
//
//        Optional<VoucherDTO> resultDTOOpt = voucherService.updateVoucher(1, voucherDTO1);
//
//        assertTrue(resultDTOOpt.isPresent());
//        assertEquals(voucherDTO1.getVoucherCode(), resultDTOOpt.get().getVoucherCode());
//        verify(voucherRepository, times(1)).findById(1);
//        verify(voucherRepository, times(1)).save(any(Voucher.class));
//    }
//
//    @Test
//    void updateVoucher_NonExistingId_ShouldReturnEmptyOptional() {
//        when(voucherRepository.findById(100)).thenReturn(Optional.empty());
//        Optional<VoucherDTO> resultDTOOpt = voucherService.updateVoucher(100, voucherDTO1);
//        assertFalse(resultDTOOpt.isPresent());
//        verify(voucherRepository, times(1)).findById(100);
//        verify(voucherRepository, never()).save(any());
//    }
//
//    @Test
//    void findVoucherByCode_ExistingCode_ShouldReturnVoucherDTO() {
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
////        when(voucherService.convertToDTO(voucher1)).thenReturn(voucherDTO1); // Mock convertToDTO in service
//
//        Optional<VoucherDTO> resultDTOOpt = voucherService.findVoucherByCode("VOUCHER10");
//
//        assertTrue(resultDTOOpt.isPresent());
//        assertEquals(voucherDTO1.getVoucherCode(), resultDTOOpt.get().getVoucherCode());
//        verify(voucherRepository, times(1)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void findVoucherByCode_NonExistingCode_ShouldReturnEmptyOptional() {
//        when(voucherRepository.findByVoucherCode("NONEXIST")).thenReturn(Optional.empty());
//        Optional<VoucherDTO> resultDTOOpt = voucherService.findVoucherByCode("NONEXIST");
//        assertFalse(resultDTOOpt.isPresent());
//        verify(voucherRepository, times(1)).findByVoucherCode("NONEXIST");
//    }
//
//    @Test
//    void endVoucher_ExistingId_ShouldReturnVoucherDTOWithInactiveStatus() {
//        Voucher inactiveVoucher = new Voucher();
//        inactiveVoucher.setVoucherId(1);
//        inactiveVoucher.setVoucherStatus(voucherStatusInactive);
//
//        VoucherDTO inactiveVoucherDTO = new VoucherDTO();
//        inactiveVoucherDTO.setVoucherStatus(voucherStatusInactive);
//
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
//        when(voucherStatusRespository.getReferenceById(1)).thenReturn(voucherStatusInactive);
//        when(voucherRepository.save(any(Voucher.class))).thenReturn(inactiveVoucher);
////        when(voucherService.convertToDTO(inactiveVoucher)).thenReturn(inactiveVoucherDTO); // Mock convertToDTO in service
//
//
//        Optional<VoucherDTO> resultDTOOpt = voucherService.endVoucher(1);
//
//        assertTrue(resultDTOOpt.isPresent());
//        assertEquals(voucherStatusInactive.getVoucherStatusName(), resultDTOOpt.get().getVoucherStatus().getVoucherStatusName());
//        verify(voucherRepository, times(1)).findById(1);
//        verify(voucherRepository, times(1)).save(any(Voucher.class));
//    }
//
//    @Test
//    void endVoucher_NonExistingId_ShouldReturnEmptyOptional() {
//        when(voucherRepository.findById(100)).thenReturn(Optional.empty());
//        Optional<VoucherDTO> resultDTOOpt = voucherService.endVoucher(100);
//        assertFalse(resultDTOOpt.isPresent());
//        verify(voucherRepository, times(1)).findById(100);
//        verify(voucherRepository, never()).save(any());
//    }
//
//    @Test
//    void deleteVoucher_ExistingId_ShouldDeleteVoucher() {
//        doNothing().when(voucherRepository).deleteById(1);
//        voucherService.deleteVoucher(1);
//        verify(voucherRepository, times(1)).deleteById(1);
//    }
//
//    @Test
//    void checkVoucherUsage_VoucherCodeNotFound_ShouldThrowException() {
//        when(voucherRepository.findByVoucherCode("NONEXIST")).thenReturn(Optional.empty());
//        assertThrows(IllegalArgumentException.class, () -> voucherService.checkVoucherUsage("user1", "NONEXIST"));
//        verify(voucherRepository, times(1)).findByVoucherCode("NONEXIST");
//    }
//
//    @Test
//    void checkVoucherUsage_UsageLimitReached_ShouldThrowException() {
//        Voucher voucherLimitReached = new Voucher();
//        voucherLimitReached.setVoucherUsageLimit(1);
//        voucherLimitReached.setVoucherUsageCount(1);
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucherLimitReached));
//
//        assertThrows(IllegalStateException.class, () -> voucherService.checkVoucherUsage("user1", "VOUCHER10"));
//        verify(voucherRepository, times(1)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void addUsersToVoucher_UserNotFound_ShouldThrowException() {
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
//        when(userRepository.findById("user1")).thenReturn(Optional.empty());
//        assertThrows(ResourceNotFoundException.class, () -> voucherService.addUsersToVoucher(Collections.singletonList("user1"), 1));
//        verify(voucherRepository, times(1)).findById(1);
//        verify(userRepository, times(1)).findById("user1");
//        verify(userVoucherRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void addUsersToVoucher_UsersAndVoucherFound_ShouldAddUserVouchers() {
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
//        when(userRepository.findById("user1")).thenReturn(Optional.of(user1));
//        when(userVoucherRepository.existsById_UserIdAndId_VoucherId("user1", 1)).thenReturn(false);
//        when(userVoucherRepository.saveAll(anyList())).thenReturn(Collections.singletonList(userVoucher1));
//
//        voucherService.addUsersToVoucher(Collections.singletonList("user1"), 1);
//
//        verify(voucherRepository, times(1)).findById(1);
//        verify(userRepository, times(1)).findById("user1");
//        verify(userVoucherRepository, times(1)).existsById_UserIdAndId_VoucherId("user1", 1);
//        verify(userVoucherRepository, times(1)).saveAll(anyList());
//    }
//
//    @Test
//    void addUsersToVoucher_UserVoucherAlreadyExists_ShouldNotAddDuplicate() {
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
//        when(userRepository.findById("user1")).thenReturn(Optional.of(user1));
//        when(userVoucherRepository.existsById_UserIdAndId_VoucherId("user1", 1)).thenReturn(true);
//
//        voucherService.addUsersToVoucher(Collections.singletonList("user1"), 1);
//
//        verify(voucherRepository, times(1)).findById(1);
//        verify(userRepository, times(0)).findById("user1");
//        verify(userVoucherRepository, times(1)).existsById_UserIdAndId_VoucherId("user1", 1);
//        verify(userVoucherRepository, never()).saveAll(anyList());
//    }
//
//    @Test
//    void removeUserFromVoucher_UserVoucherExists_ShouldDeleteUserVoucher() {
//        when(userVoucherRepository.findById_UserIdAndId_VoucherId("user1", 1)).thenReturn(Optional.of(userVoucher1));
//        doNothing().when(userVoucherRepository).delete(userVoucher1);
//
//        voucherService.removeUserFromVoucher("user1", 1);
//
//        verify(userVoucherRepository, times(1)).findById_UserIdAndId_VoucherId("user1", 1);
//        verify(userVoucherRepository, times(1)).delete(userVoucher1);
//    }
//
//    @Test
//    void removeUserFromVoucher_UserVoucherDoesNotExist_ShouldDoNothing() {
//        when(userVoucherRepository.findById_UserIdAndId_VoucherId("user1", 1)).thenReturn(Optional.empty());
//
//        voucherService.removeUserFromVoucher("user1", 1);
//
//        verify(userVoucherRepository, times(1)).findById_UserIdAndId_VoucherId("user1", 1);
//        verify(userVoucherRepository, never()).delete(any());
//    }
//
//    @Test
//    void getVouchersByUserId_UserHasValidVouchers_ShouldReturnVoucherDTOList() {
//        when(userVoucherRepository.findAllById_UserId("user1")).thenReturn(Collections.singletonList(userVoucher1));
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(voucher1));
//        when(voucherStatusRespository.findByVoucherStatusName("INACTIVE")).thenReturn(voucherStatusInactive);
////        when(voucherService.convertToDTO(voucher1)).thenReturn(voucherDTO1); // Mock convertToDTO in service
//
//        List<VoucherDTO> resultDTOs = voucherService.getVouchersByUserId("user1");
//
//        assertNotNull(resultDTOs);
//        assertEquals(1, resultDTOs.size());
//        assertEquals(voucherDTO1.getVoucherCode(), resultDTOs.get(0).getVoucherCode());
//        verify(userVoucherRepository, times(1)).findAllById_UserId("user1");
//        verify(voucherRepository, times(1)).findById(1);
//    }
//
//    @Test
//    void getVouchersByUserId_UserHasNoValidVouchers_ShouldReturnEmptyList() {
//        when(userVoucherRepository.findAllById_UserId("user1")).thenReturn(Collections.emptyList());
//        List<VoucherDTO> resultDTOs = voucherService.getVouchersByUserId("user1");
//        assertNotNull(resultDTOs);
//        assertTrue(resultDTOs.isEmpty());
//        verify(userVoucherRepository, times(1)).findAllById_UserId("user1");
//        verify(voucherRepository, never()).findById(anyInt());
//    }
//
//    @Test
//    void getVouchersByUserId_VoucherExpired_ShouldReturnEmptyList() {
//        Voucher expiredVoucher = new Voucher();
//        expiredVoucher.setVoucherEndDate(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
//        expiredVoucher.setVoucherStatus(voucherStatusActive);
//        when(userVoucherRepository.findAllById_UserId("user1")).thenReturn(Collections.singletonList(userVoucher1));
//        when(voucherRepository.findById(1)).thenReturn(Optional.of(expiredVoucher));
//        when(voucherStatusRespository.findByVoucherStatusName("INACTIVE")).thenReturn(voucherStatusInactive);
//
//        List<VoucherDTO> resultDTOs = voucherService.getVouchersByUserId("user1");
//        assertNotNull(resultDTOs);
//        assertTrue(resultDTOs.isEmpty());
//        verify(userVoucherRepository, times(1)).findAllById_UserId("user1");
//        verify(voucherRepository, times(1)).findById(1);
//        verify(voucherStatusRespository, times(1)).findByVoucherStatusName("INACTIVE");
//        assertEquals(voucherStatusInactive, expiredVoucher.getVoucherStatus()); // Verify status updated to inactive
//    }
//
//    @Test
//    void getUsersByVoucherId_VoucherExistsWithUsers_ShouldReturnUserMap() {
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.singletonList(userVoucher1));
//        when(userRepository.findById("user1")).thenReturn(Optional.of(user1));
//
//        Map<String, Object> resultMap = voucherService.getUsersByVoucherId(1);
//
//        assertNotNull(resultMap);
//        assertNotNull(resultMap.get("users"));
//        assertNotNull(resultMap.get("userVouchers"));
//        assertNotNull(resultMap.get("allowedUserIds"));
//        List<VoucherUserViewDTO> users = (List<VoucherUserViewDTO>) resultMap.get("users");
//        assertEquals(1, users.size());
//        assertEquals("testUser", users.get(0).getUsername());
//        Set<String> allowedUserIds = (Set<String>) resultMap.get("allowedUserIds");
//        assertEquals(1, allowedUserIds.size());
//        assertTrue(allowedUserIds.contains("user1"));
//        List<UserVoucher> userVouchers = (List<UserVoucher>) resultMap.get("userVouchers");
//        assertEquals(1, userVouchers.size());
//        assertEquals("user1", userVouchers.get(0).getId().getUserId());
//
//        verify(userVoucherRepository, times(1)).findAllById_VoucherId(1);
//        verify(userRepository, times(1)).findById("user1");
//    }
//
//    @Test
//    void getUsersByVoucherId_VoucherExistsWithoutUsers_ShouldReturnEmptyUserMap() {
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.emptyList());
//
//        Map<String, Object> resultMap = voucherService.getUsersByVoucherId(1);
//
//        assertNotNull(resultMap);
//        assertNotNull(resultMap.get("users"));
//        assertNotNull(resultMap.get("userVouchers"));
//        assertNotNull(resultMap.get("allowedUserIds"));
//        List<VoucherUserViewDTO> users = (List<VoucherUserViewDTO>) resultMap.get("users");
//        assertTrue(users.isEmpty());
//        List<UserVoucher> userVouchers = (List<UserVoucher>) resultMap.get("userVouchers");
//        assertTrue(userVouchers.isEmpty());
//        Set<String> allowedUserIds = (Set<String>) resultMap.get("allowedUserIds");
//        assertTrue(allowedUserIds.isEmpty());
//
//        verify(userVoucherRepository, times(1)).findAllById_VoucherId(1);
//        verify(userRepository, never()).findById(anyString());
//    }
//
//    @Test
//    void checkUserVoucher_UserNotAuthenticated_ShouldReturnUnauthorized() {
//        SecurityContextHolder.clearContext(); // No authentication
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
//        verify(userRepository, never()).findByUserUsername(anyString());
//        verify(voucherRepository, never()).findByVoucherCode(anyString());
//    }
//
//    @Test
//    void checkUserVoucher_UserIdNotFound_ShouldReturnNotFound() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, never()).findByVoucherCode(anyString());
//    }
//
//    @Test
//    void checkUserVoucher_VoucherCodeNotFound_ShouldReturnNotFoundResponse() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("NONEXIST")).thenReturn(Optional.empty());
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("NONEXIST", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(1)).findByVoucherCode("NONEXIST");
//    }
//
//    @Test
//    void checkUserVoucher_UserNotAllowedForVoucher_ShouldReturnForbidden() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.emptyList()); // User not in allowed list
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.FORBIDDEN, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(1)).findByVoucherCode("VOUCHER10");
//        verify(userVoucherRepository, times(1)).findAllById_VoucherId(1);
//    }
//
//    @Test
//    void checkUserVoucher_VoucherExpired_ShouldReturnGone() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//
//        Voucher expiredVoucher = voucher1;
//        expiredVoucher.setVoucherStatus(voucherStatusInactive);
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(expiredVoucher));
////        when(voucherService.getUsersByVoucherId(1)).thenReturn(Collections.emptyMap()); // Mock getUsersByVoucherId
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.singletonList(userVoucher1));
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.GONE, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(2)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void checkUserVoucher_VoucherInactive_ShouldReturnGone() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        Voucher inactiveVoucher = voucher1;
//        inactiveVoucher.setVoucherStatus(voucherStatusInactive);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(inactiveVoucher));
//      //  when(voucherService.getUsersByVoucherId(1)).thenReturn(Collections.emptyMap()); // Mock getUsersByVoucherId
//
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.singletonList(userVoucher1));
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.GONE, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(2)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void checkUserVoucher_MinimumOrderValueNotMet_ShouldReturnBadRequest() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
////        when(voucherService.getUsersByVoucherId(1)).thenReturn(Collections.emptyMap()); // Mock getUsersByVoucherId
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.singletonList(userVoucher1));
////        when(voucherService.checkVoucherUsage("user1", "VOUCHER10")).thenReturn(false); // Mock checkVoucherUsage
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(20)); // Subtotal less than minimum
//
//        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(2)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void checkUserVoucher_ValidVoucher_ShouldReturnOkWithVoucherDTO() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
////        when(voucherService.getUsersByVoucherId(1)).thenReturn(Collections.singletonMap("allowedUserIds", Collections.singleton("user1"))); // Mock getUsersByVoucherId
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.singletonList(userVoucher1));
////        when(voucherService.checkVoucherUsage("user1", "VOUCHER10")).thenReturn(false); // Mock checkVoucherUsage
//        when(userVoucherRepository.findById_UserIdAndId_VoucherId("user1", 1)).thenReturn(Optional.empty());
////        when(voucherService.findVoucherByCode("VOUCHER10")).thenReturn(Optional.of(voucherDTO1)); // Mock findVoucherByCode
//
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        VoucherDTO resultDTO = (VoucherDTO) responseEntity.getBody();
//        assertNotNull(resultDTO);
//        assertEquals(voucherDTO1.getVoucherCode(), resultDTO.getVoucherCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(2)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void checkUserVoucher_UserAlreadyUsedVoucher_ShouldReturnNotFoundUserUsed() {
//        Authentication authentication = mock(Authentication.class);
//        UserDetails userDetails = mock(UserDetails.class);
//        when(authentication.getPrincipal()).thenReturn(userDetails);
//        when(userDetails.getUsername()).thenReturn("testUser");
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        UserVoucher userVoucher = userVoucher1;
//        userVoucher.setIsVoucherUsed(true);
//
//        when(userRepository.findByUserUsername("testUser")).thenReturn(Optional.of(user1));
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
////        when(voucherService.getUsersByVoucherId(1)).thenReturn(Collections.emptyMap()); // Mock getUsersByVoucherId
//        when(userVoucherRepository.findAllById_VoucherId(1)).thenReturn(Collections.singletonList(userVoucher));
////        when(voucherService.checkVoucherUsage("user1", "VOUCHER10")).thenReturn(true); // Mock checkVoucherUsage
//
//
//        ResponseEntity<?> responseEntity = voucherService.checkUserVoucher("VOUCHER10", BigDecimal.valueOf(100));
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        verify(userRepository, times(1)).findByUserUsername("testUser");
//        verify(voucherRepository, times(2)).findByVoucherCode("VOUCHER10");
//    }
//
//    @Test
//    void updateUsageLimit_VoucherCodeNotFound_ShouldThrowException() {
//        when(voucherRepository.findByVoucherCode("NONEXIST")).thenReturn(Optional.empty());
//        assertThrows(IllegalArgumentException.class, () -> voucherService.updateUsageLimit("NONEXIST", "user1"));
//        verify(voucherRepository, times(1)).findByVoucherCode("NONEXIST");
//        verify(userVoucherRepository, never()).findById_UserIdAndId_VoucherId(anyString(), anyInt());
//    }
//
//    @Test
//    void updateUsageLimit_UserNotAssignedVoucher_ShouldThrowException() {
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
//        when(userVoucherRepository.findById_UserIdAndId_VoucherId("user1", 1)).thenReturn(Optional.empty());
//
//        assertThrows(IllegalStateException.class, () -> voucherService.updateUsageLimit("VOUCHER10", "user1"));
//        verify(voucherRepository, times(1)).findByVoucherCode("VOUCHER10");
//        verify(userVoucherRepository, times(1)).findById_UserIdAndId_VoucherId("user1", 1);
//    }
//
//    @Test
//    void updateUsageLimit_UserAlreadyUsedVoucher_ShouldThrowException() {
//        UserVoucher usedVoucher = new UserVoucher();
//        usedVoucher.setIsVoucherUsed(true);
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucher1));
//        when(userVoucherRepository.findById_UserIdAndId_VoucherId("user1", 1)).thenReturn(Optional.of(usedVoucher));
//
//        assertThrows(IllegalStateException.class, () -> voucherService.updateUsageLimit("VOUCHER10", "user1"));
//        verify(voucherRepository, times(1)).findByVoucherCode("VOUCHER10");
//        verify(userVoucherRepository, times(1)).findById_UserIdAndId_VoucherId("user1", 1);
//    }
//
//    @Test
//    void updateUsageLimit_ValidUsage_ShouldSetVoucherInactiveWhenLimitReached() {
//        Voucher voucherUsageCountEqualsLimitMinusOne = new Voucher();
//        voucherUsageCountEqualsLimitMinusOne.setVoucherUsageLimit(1);
//        voucherUsageCountEqualsLimitMinusOne.setVoucherUsageCount(0);
//        voucherUsageCountEqualsLimitMinusOne.setVoucherStatus(voucherStatusActive);
//
//        UserVoucher notUsedVoucher = new UserVoucher();
//        notUsedVoucher.setIsVoucherUsed(false);
//
//        when(voucherRepository.findByVoucherCode("VOUCHER10")).thenReturn(Optional.of(voucherUsageCountEqualsLimitMinusOne));
//        when(userVoucherRepository.findById_UserIdAndId_VoucherId("user1", 1)).thenReturn(Optional.of(notUsedVoucher));
//        when(userVoucherRepository.save(any(UserVoucher.class))).thenReturn(notUsedVoucher);
//        when(voucherRepository.save(any(Voucher.class))).thenReturn(voucherUsageCountEqualsLimitMinusOne);
//        when(voucherStatusRespository.findByVoucherStatusName("INACTIVE")).thenReturn(voucherStatusInactive);
//
////        voucherService.updateUsageLimit("VOUCHER10", "user1");
//        assertThrows(IllegalStateException.class, () -> voucherService.updateUsageLimit("VOUCHER10", "user1"));
//
////        assertEquals(voucherStatusInactive, voucherUsageCountEqualsLimitMinusOne.getVoucherStatus()); // Assert Voucher status set to inactive
////        verify(voucherStatusRespository, times(1)).findByVoucherStatusName("INACTIVE");
//    }
//
//    // Note: convertToDTO and convertToEntity are private methods and are implicitly tested in other tests.
//    // Explicitly testing them might require making them protected or using reflection, which is generally not recommended
//    // unless the conversion logic is very complex and needs isolated testing.
//}