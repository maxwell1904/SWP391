package com.unleashed.service;

import com.unleashed.dto.VoucherDTO;
import com.unleashed.dto.VoucherUserViewDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.dto.mapper.UserMapper;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.UserVoucherId;
import com.unleashed.repo.*;
import com.unleashed.repo.specification.VoucherSpecification;
import com.unleashed.util.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final VoucherStatusRespository voucherStatusRespository;
    private final VoucherTypeRepository voucherTypeRepository;
    private final RankRepository rankRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public VoucherService(VoucherRepository voucherRepository,
                           UserVoucherRepository userVoucherRepository,
                           UserRepository userRepository,
                           JwtUtil jwtUtil,
                           UserMapper userMapper,
                           VoucherStatusRespository voucherStatusRespository,
                           VoucherTypeRepository voucherTypeRepository,
                           RankRepository rankRepository,
                           OrderRepository orderRepository) {
        this.voucherRepository = voucherRepository;
        this.userVoucherRepository = userVoucherRepository;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
        this.voucherStatusRespository = voucherStatusRespository;
        this.voucherTypeRepository = voucherTypeRepository;
        this.rankRepository = rankRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public void performScheduledStatusUpdates() {
        VoucherStatus activeStatus = voucherStatusRespository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("Critical: ACTIVE VoucherStatus not found."));
        VoucherStatus inactiveStatus = voucherStatusRespository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Critical: INACTIVE VoucherStatus not found."));
        VoucherStatus expiredStatus = voucherStatusRespository.findById(3)
                .orElseThrow(() -> new EntityNotFoundException("Critical: EXPIRED VoucherStatus not found."));

        updateVouchersToActive(inactiveStatus, activeStatus);
        updateVouchersToInactiveOnUsage(activeStatus, inactiveStatus);
        updateVouchersToExpired(expiredStatus);
    }

    private void updateVouchersToActive(VoucherStatus inactiveStatus, VoucherStatus activeStatus) {
        OffsetDateTime now = OffsetDateTime.now();
        List<Voucher> vouchersToActivate = voucherRepository
                .findByVoucherStatusAndVoucherStartDateBeforeAndVoucherEndDateAfter(inactiveStatus, now, now);

        if (!vouchersToActivate.isEmpty()) {
            for (Voucher voucher : vouchersToActivate) {
                if (voucher.getVoucherUsageLimit() == null || voucher.getVoucherUsageCount() < voucher.getVoucherUsageLimit()) {
                    voucher.setVoucherStatus(activeStatus);
                }
            }
            voucherRepository.saveAll(vouchersToActivate);
        }
    }

    private void updateVouchersToInactiveOnUsage(VoucherStatus activeStatus, VoucherStatus inactiveStatus) {
        List<Voucher> activeVouchers = voucherRepository.findByVoucherStatus(activeStatus);
        List<Voucher> vouchersToInactivate = new ArrayList<>();
        for (Voucher voucher : activeVouchers) {
            if (voucher.getVoucherUsageLimit() != null && voucher.getVoucherUsageCount() >= voucher.getVoucherUsageLimit()) {
                vouchersToInactivate.add(voucher);
            }
        }

        if (!vouchersToInactivate.isEmpty()) {
            for (Voucher voucher : vouchersToInactivate) {
                voucher.setVoucherStatus(inactiveStatus);
            }
            voucherRepository.saveAll(vouchersToInactivate);
        }
    }

    private void updateVouchersToExpired(VoucherStatus expiredStatus) {
        OffsetDateTime now = OffsetDateTime.now();
        List<Voucher> vouchersToExpire = voucherRepository
                .findAllByVoucherEndDateBeforeAndVoucherStatusNot(now, expiredStatus);

        if (!vouchersToExpire.isEmpty()) {
            for (Voucher voucher : vouchersToExpire) {
                voucher.setVoucherStatus(expiredStatus);
            }
            voucherRepository.saveAll(vouchersToExpire);
        }
    }

    private void setInitialVoucherStatus(Voucher voucher) {
        VoucherStatus activeStatus = voucherStatusRespository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("Critical: ACTIVE VoucherStatus not found."));
        VoucherStatus inactiveStatus = voucherStatusRespository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Critical: INACTIVE VoucherStatus not found."));

        final OffsetDateTime now = OffsetDateTime.now();
        boolean isAlreadyStarted = !voucher.getVoucherStartDate().isAfter(now);
        boolean isNotYetEnded = !voucher.getVoucherEndDate().isBefore(now);

        if (isAlreadyStarted && isNotYetEnded) {
            voucher.setVoucherStatus(activeStatus);
        } else {
            voucher.setVoucherStatus(inactiveStatus);
        }
    }

    @Transactional
    public VoucherDTO addVoucher(VoucherDTO voucherDTO) {
        if (voucherDTO.getStartDate() != null && voucherDTO.getEndDate() != null &&
                voucherDTO.getStartDate().isAfter(voucherDTO.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        Voucher voucher = convertToEntity(voucherDTO);
        setInitialVoucherStatus(voucher);
        voucher.setVoucherUsageCount(0);
        voucher.setVoucherCreatedAt(OffsetDateTime.now());

        return convertToDTO(voucherRepository.save(voucher));
    }

    @Transactional
    public Optional<VoucherDTO> updateVoucher(Integer voucherId, VoucherDTO voucherDTO) {
        return voucherRepository.findById(voucherId).map(existingVoucher -> {
            existingVoucher.setVoucherCode(voucherDTO.getVoucherCode());
            existingVoucher.setVoucherValue(voucherDTO.getVoucherValue());
            existingVoucher.setVoucherStartDate(voucherDTO.getStartDate());
            existingVoucher.setVoucherEndDate(voucherDTO.getEndDate());
            existingVoucher.setVoucherDescription(voucherDTO.getVoucherDescription());
            existingVoucher.setVoucherMinimumOrderValue(voucherDTO.getMinimumOrderValue());
            existingVoucher.setVoucherMaximumValue(voucherDTO.getMaximumVoucherValue());
            existingVoucher.setVoucherUsageLimit(voucherDTO.getUsageLimit());

            if (voucherDTO.getVoucherType() != null && voucherDTO.getVoucherType().getId() != null) {
                VoucherType voucherType = voucherTypeRepository.findById(voucherDTO.getVoucherType().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("VoucherType not found"));
                existingVoucher.setVoucherType(voucherType);
            }

            setInitialVoucherStatus(existingVoucher);

            existingVoucher.setVoucherUpdatedAt(OffsetDateTime.now(ZoneId.systemDefault()));

            return Optional.of(convertToDTO(voucherRepository.save(existingVoucher)));
        }).orElse(Optional.empty());
    }

    @Transactional(readOnly = true)
    public List<VoucherDTO> getVouchersByUserId(String userId) {
        List<UserVoucher> userVouchers = userVoucherRepository.findAllById_UserId(UUID.fromString(userId));

        return userVouchers.stream()
                .map(UserVoucher::getVoucher)
                .filter(voucher -> "ACTIVE".equalsIgnoreCase(voucher.getVoucherStatus().getVoucherStatusName()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean isVoucherCodeExists(String voucherCode) {
        return voucherRepository.findByVoucherCode(voucherCode).isPresent();
    }

    public Page<VoucherDTO> getAllVouchers(String search, Integer statusId, Integer typeId, Pageable pageable) {
        Specification<Voucher> spec = new VoucherSpecification(search, statusId, typeId, null);
        return voucherRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<VoucherDTO> getVouchersForUser(String userId, String search, Integer statusId, Integer typeId, int page, int size, String sortBy, String sortOrder) {
        List<Integer> userVoucherIds = userVoucherRepository.findVoucherIdsByUserId(UUID.fromString(userId));

        if (userVoucherIds.isEmpty()) {
            return Page.empty(PageRequest.of(page, size));
        }

        Sort finalSort;
        if ("amount".equalsIgnoreCase(sortBy)) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
            finalSort = Sort.by(new Sort.Order(direction, "voucherValue"));
        } else {
            finalSort = Sort.by(
                    Sort.Order.asc("voucherStatus.id"),
                    Sort.Order.asc("voucherEndDate")
            );
        }

        Pageable pageable = PageRequest.of(page, size, finalSort);

        Specification<Voucher> spec = new VoucherSpecification(search, statusId, typeId, userVoucherIds);

        return voucherRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<VoucherDTO> getVoucherForUserById(Integer voucherId, String userId) {
        boolean isAssigned = userVoucherRepository.existsById_UserIdAndId_VoucherId(UUID.fromString(userId), voucherId);

        if (!isAssigned) {
            return Optional.empty();
        }

        return voucherRepository.findById(voucherId).map(this::convertToDTO);
    }

    public Optional<VoucherDTO> getVoucherById(int voucherId) {
        return voucherRepository.findById(voucherId).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<VoucherStatus> findAllStatuses() {
        return voucherStatusRespository.findAll();
    }

    @Transactional(readOnly = true)
    public List<VoucherType> findAllTypes() {
        return voucherTypeRepository.findAll();
    }

    public Optional<VoucherDTO> findVoucherByCode(String voucherCode) {
        return voucherRepository.findByVoucherCode(voucherCode).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<Voucher> findVoucherEntityByCode(String voucherCode) {
        return voucherRepository.findByVoucherCode(voucherCode);
    }

    public Optional<VoucherDTO> endVoucher(int voucherId) {
        return voucherRepository.findById(voucherId).map(voucher -> {
            voucher.setVoucherStatus(voucherStatusRespository.getReferenceById(1)); // 1 = INACTIVE
            return convertToDTO(voucherRepository.save(voucher));
        });
    }

    @Transactional
    public void deleteVoucher(int voucherId) {
        voucherRepository.deleteById(voucherId);
    }

    public boolean checkVoucherUsage(String userId, String voucherCode) {
        Optional<Voucher> voucherOpt = voucherRepository.findByVoucherCode(voucherCode);
        if (voucherOpt.isEmpty()) {
            throw new IllegalArgumentException("Voucher code not found.");
        }
        Voucher voucher = voucherOpt.get();
        UUID userUuid = UUID.fromString(userId);
        int currentUsageCount = voucher.getVoucherUsageCount() == null ? 0 : voucher.getVoucherUsageCount();

        if (voucher.getVoucherUsageLimit() != null && currentUsageCount >= voucher.getVoucherUsageLimit()) {
            throw new IllegalStateException("This voucher has been fully used by all users.");
        }

        if (isPrivateVoucher(voucher.getVoucherId())) {
            return userVoucherRepository
                    .findById_UserIdAndId_VoucherId(userUuid, voucher.getVoucherId())
                    .map(UserVoucher::getIsVoucherUsed)
                    .orElse(false);
        }

        return hasUserUsedPublicVoucher(userUuid, voucher.getVoucherId());
    }

    @Transactional
    public void addUsersToVoucher(List<String> userIds, Integer voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found."));
        List<UserVoucher> userVouchers = new ArrayList<>();
        for (String userIdStr : userIds) {
            UUID userUuid = UUID.fromString(userIdStr);
            if (!userVoucherRepository.existsById_UserIdAndId_VoucherId(userUuid, voucherId)) {
                User user = userRepository.findById(userUuid)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userIdStr));
                UserVoucherId userVoucherId = new UserVoucherId(voucher.getVoucherId(), user.getUserId());
                UserVoucher userVoucher = new UserVoucher(userVoucherId, voucher, user, false, null);
                userVouchers.add(userVoucher);
            }
        }
        if (!userVouchers.isEmpty()) {
            userVoucherRepository.saveAll(userVouchers);
        }
    }

    @Transactional
    public void removeUserFromVoucher(String userId, Integer voucherId) {
        UUID userUuid = UUID.fromString(userId);
        userVoucherRepository.findById_UserIdAndId_VoucherId(userUuid, voucherId)
                .ifPresent(userVoucherRepository::delete);
    }

    public Map<String, Object> getUsersByVoucherId(Integer voucherId) {
        List<UserVoucher> userVouchers = userVoucherRepository.findAllById_VoucherId(voucherId);
        Set<UUID> allowedUserIds = userVouchers.stream()
                .map(userVoucher -> userVoucher.getId().getUserId())
                .collect(Collectors.toSet());
        List<VoucherUserViewDTO> users = userVouchers.stream()
                .map(userVoucher -> userRepository.findById(userVoucher.getId().getUserId())
                        .map(user -> new VoucherUserViewDTO(user.getUserId().toString(), user.getUserUsername(), user.getUserEmail(), user.getUserFullname(), user.getUserImage()))
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("allowedUserIds", allowedUserIds);
        return result;
    }

    private boolean isPrivateVoucher(Integer voucherId) {
        return userVoucherRepository.countByVoucherId(voucherId) > 0;
    }

    private boolean hasUserUsedPublicVoucher(UUID userId, Integer voucherId) {
        return orderRepository.existsByUser_UserIdAndVoucher_VoucherId(userId, voucherId);
    }

    public ResponseEntity<?> checkUserVoucher(String voucherCode, BigDecimal subTotal) {
        DecimalFormat decimalFormat = new DecimalFormat("#,##0.00");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        if (currentUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ResponseDTO(HttpStatus.UNAUTHORIZED.value(), "User not authenticated"));
        }
        UUID userId = userRepository.findByUserUsername(currentUsername).map(User::getUserId).orElse(null);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseDTO(HttpStatus.NOT_FOUND.value(), "User ID not found for authenticated user"));
        }
        Optional<Voucher> voucherOpt = voucherRepository.findByVoucherCode(voucherCode);
        if (voucherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseDTO(HttpStatus.NOT_FOUND.value(), "Voucher code not found"));
        }

        Voucher voucher = voucherOpt.get();
        VoucherDTO voucherDTO = convertToDTO(voucher);

        if (isPrivateVoucher(voucher.getVoucherId())
                && !userVoucherRepository.existsById_UserIdAndId_VoucherId(userId, voucher.getVoucherId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ResponseDTO(HttpStatus.FORBIDDEN.value(), "User is not available for this voucher"));
        }

        boolean hasVoucher;
        try {
            hasVoucher = checkVoucherUsage(userId.toString(), voucherCode);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.GONE).body(new ResponseDTO(HttpStatus.GONE.value(), e.getMessage()));
        }

        if (!hasVoucher) {
            if (!"ACTIVE".equalsIgnoreCase(voucherDTO.getVoucherStatus().getVoucherStatusName())) {
                return ResponseEntity.status(HttpStatus.GONE).body(new ResponseDTO(HttpStatus.GONE.value(), "Voucher is not active."));
            }
            if (voucherDTO.getMinimumOrderValue() != null
                    && voucherDTO.getMinimumOrderValue().compareTo(subTotal) > 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "The minimum order value is " + decimalFormat.format(voucherDTO.getMinimumOrderValue()) + ". Please add more items to your cart."));
            }
            return ResponseEntity.ok(voucherDTO);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseDTO(HttpStatus.NOT_FOUND.value(), "User used this voucher"));
        }
    }

    @Transactional
    public void updateUsageLimit(String voucherCode, String userId) {
        Optional<Voucher> voucherOpt = voucherRepository.findByVoucherCode(voucherCode);
        if (voucherOpt.isEmpty()) {
            throw new IllegalArgumentException("Voucher code not found.");
        }
        Voucher voucher = voucherOpt.get();
        int currentUsageCount = voucher.getVoucherUsageCount() == null ? 0 : voucher.getVoucherUsageCount();
        if (voucher.getVoucherUsageLimit() != null && currentUsageCount >= voucher.getVoucherUsageLimit()) {
            throw new IllegalStateException("This voucher has been fully used.");
        }

        UUID userUuid = UUID.fromString(userId);
        if (isPrivateVoucher(voucher.getVoucherId())) {
            UserVoucher userVoucher = userVoucherRepository.findById_UserIdAndId_VoucherId(userUuid, voucher.getVoucherId())
                    .orElseThrow(() -> new IllegalStateException("User has not been assigned this voucher."));
            if (Boolean.TRUE.equals(userVoucher.getIsVoucherUsed())) {
                throw new IllegalStateException("User has already used this voucher.");
            }
            userVoucher.setIsVoucherUsed(true);
            userVoucher.setVoucherUsedAt(OffsetDateTime.now());
            userVoucherRepository.save(userVoucher);
        } else if (hasUserUsedPublicVoucher(userUuid, voucher.getVoucherId())) {
            throw new IllegalStateException("User has already used this voucher.");
        }

        voucher.setVoucherUsageCount(currentUsageCount + 1);
        if (voucher.getVoucherUsageLimit() != null && voucher.getVoucherUsageCount() >= voucher.getVoucherUsageLimit()) {
            VoucherStatus inactiveVoucherStatus = voucherStatusRespository.findByVoucherStatusName("INACTIVE");
            if (inactiveVoucherStatus != null) {
                voucher.setVoucherStatus(inactiveVoucherStatus);
            }
        }
        voucherRepository.save(voucher);
    }

    public VoucherDTO convertToDTO(Voucher voucher) {
        if (voucher == null) {
            return null;
        }

        VoucherDTO dto = new VoucherDTO();
        dto.setVoucherId(voucher.getVoucherId());
        dto.setVoucherCode(voucher.getVoucherCode());
        dto.setVoucherType(voucher.getVoucherType());
        dto.setVoucherValue(voucher.getVoucherValue());
        dto.setStartDate(voucher.getVoucherStartDate());
        dto.setEndDate(voucher.getVoucherEndDate());
        dto.setVoucherStatus(voucher.getVoucherStatus());
        dto.setVoucherDescription(voucher.getVoucherDescription());
        dto.setMinimumOrderValue(voucher.getVoucherMinimumOrderValue());
        dto.setMaximumVoucherValue(voucher.getVoucherMaximumValue());
        dto.setUsageLimit(voucher.getVoucherUsageLimit());
        dto.setRank(voucher.getVoucherRankRequirement());
        dto.setUsageCount(voucher.getVoucherUsageCount());

        if (voucher.getVoucherType() != null) {
            dto.setVoucherTypeName(voucher.getVoucherType().getVoucherTypeName());
        }

        if (voucher.getVoucherStatus() != null) {
            dto.setVoucherStatusName(voucher.getVoucherStatus().getVoucherStatusName());
        }

        if (voucher.getVoucherRankRequirement() != null) {
            dto.setRankName(voucher.getVoucherRankRequirement().getRankName());
        } else {
            dto.setRankName("All Ranks");
        }

        return dto;
    }

    private Voucher convertToEntity(VoucherDTO voucherDTO) {
        Voucher voucher = new Voucher();
        if (voucherDTO.getVoucherId() != null) {
            voucher.setVoucherId(voucherDTO.getVoucherId());
        }
        voucher.setVoucherCode(voucherDTO.getVoucherCode());
        voucher.setVoucherValue(voucherDTO.getVoucherValue());
        voucher.setVoucherStartDate(voucherDTO.getStartDate());
        voucher.setVoucherEndDate(voucherDTO.getEndDate());

        if (voucherDTO.getVoucherStatus() != null) {
            VoucherStatus voucherStatus = voucherStatusRespository.findById(voucherDTO.getVoucherStatus().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("VoucherStatus not found"));
            voucher.setVoucherStatus(voucherStatus);
        }

        if (voucherDTO.getVoucherType() != null) {
            VoucherType voucherType = voucherTypeRepository.findById(voucherDTO.getVoucherType().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("VoucherType not found"));
            voucher.setVoucherType(voucherType);
        }

        if (voucherDTO.getRank() != null && voucherDTO.getRank().getId() != null) {
            Rank rank = rankRepository.findById(voucherDTO.getRank().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rank not found"));
            voucher.setVoucherRankRequirement(rank);
        }

        voucher.setVoucherDescription(voucherDTO.getVoucherDescription());
        voucher.setVoucherMinimumOrderValue(voucherDTO.getMinimumOrderValue());
        voucher.setVoucherMaximumValue(voucherDTO.getMaximumVoucherValue());
        voucher.setVoucherUsageLimit(voucherDTO.getUsageLimit());
        voucher.setVoucherUsageCount(voucherDTO.getUsageCount());
        return voucher;
    }

    @Transactional(readOnly = true)
    public List<VoucherDTO> getBestVouchersForCheckout(String userId, BigDecimal cartTotal) {
        UUID userUuid = UUID.fromString(userId);
        Set<Integer> assignedVoucherIds = new HashSet<>(userVoucherRepository.findVoucherIdsByUserId(userUuid));

        // Track used private vouchers from user_voucher
        List<UserVoucher> userVouchers = userVoucherRepository.findAllById_UserId(userUuid);
        Set<Integer> usedPrivateVoucherIds = userVouchers.stream()
                .filter(UserVoucher::getIsVoucherUsed)
                .map(ud -> ud.getId().getVoucherId())
                .collect(Collectors.toSet());

        VoucherStatus activeStatus = voucherStatusRespository.findByVoucherStatusName("ACTIVE");
        if (activeStatus == null) {
            return Collections.emptyList();
        }

        List<Voucher> activeVouchers = voucherRepository.findByVoucherStatus(activeStatus);

        // Include private vouchers assigned to the user and public vouchers not yet used by this user.
        List<Voucher> applicableVouchers = activeVouchers.stream()
                .filter(d -> d.getVoucherMinimumOrderValue() == null || cartTotal.compareTo(d.getVoucherMinimumOrderValue()) >= 0)
                .filter(d -> d.getVoucherUsageLimit() == null
                        || (d.getVoucherUsageCount() == null ? 0 : d.getVoucherUsageCount()) < d.getVoucherUsageLimit())
                .filter(d -> {
                    boolean isPrivate = isPrivateVoucher(d.getVoucherId());
                    if (isPrivate) {
                        return assignedVoucherIds.contains(d.getVoucherId())
                                && !usedPrivateVoucherIds.contains(d.getVoucherId());
                    }
                    return !hasUserUsedPublicVoucher(userUuid, d.getVoucherId());
                })
                .toList();

        // Calculate the actual saving for each voucher and sort by the highest saving.
        return applicableVouchers.stream()
                .map(voucher -> {
                    BigDecimal savings = BigDecimal.ZERO;
                    // Percentage-based voucher
                    if (voucher.getVoucherType().getId() == 1) { // 1 = PERCENTAGE
                        BigDecimal potentialSavings = cartTotal.multiply(voucher.getVoucherValue().divide(BigDecimal.valueOf(100)));
                        if (voucher.getVoucherMaximumValue() != null && potentialSavings.compareTo(voucher.getVoucherMaximumValue()) > 0) {
                            savings = voucher.getVoucherMaximumValue();
                        } else {
                            savings = potentialSavings;
                        }
                    }
                    // Flat amount voucher
                    else if (voucher.getVoucherType().getId() == 2) { // 2 = FLAT
                        savings = voucher.getVoucherValue();
                    }
                    // Return a pair of the voucher and its calculated savings
                    return new AbstractMap.SimpleEntry<>(voucher, savings);
                })
                .sorted(Comparator.comparing(AbstractMap.SimpleEntry<Voucher, BigDecimal>::getValue).reversed()) // Sort descending by savings
                .limit(5) // Get the top 5
                .map(entry -> convertToDTO(entry.getKey())) // Convert back to DTO
                .collect(Collectors.toList());
    }


}