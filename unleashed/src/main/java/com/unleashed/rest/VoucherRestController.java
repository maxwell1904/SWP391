package com.unleashed.rest;

import com.unleashed.dto.VoucherDTO;
import com.unleashed.entity.VoucherStatus;
import com.unleashed.entity.VoucherType;
import com.unleashed.service.VoucherService;
import com.unleashed.service.UserService;
import com.unleashed.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherRestController {

    private static final Logger logger = LoggerFactory.getLogger(VoucherRestController.class);
    private final VoucherService voucherService;
    private final UserService userService;

    @Autowired
    public VoucherRestController(VoucherService voucherService, UserService userService) {
        this.voucherService = voucherService;
        this.userService = userService;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody VoucherDTO voucherDTO) {
        try {
            VoucherDTO createdVoucher = voucherService.addVoucher(voucherDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVoucher);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create voucher: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/{voucherId}")
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable int voucherId) {
        return voucherService.getVoucherById(voucherId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Voucher ID {} not found.", voucherId);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                });
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{voucherId}")
    public ResponseEntity<VoucherDTO> updateVoucher(
            @PathVariable Integer voucherId,
            @RequestBody VoucherDTO voucherDTO) {
        return voucherService.updateVoucher(voucherId, voucherDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Voucher ID {} not found for update.", voucherId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<Page<VoucherDTO>> getAllVouchers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer typeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "voucherId"));
        Page<VoucherDTO> vouchers = voucherService.getAllVouchers(search, statusId, typeId, pageable);
        return ResponseEntity.ok(vouchers);
    }

    // --- FIX 1 ---
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    @GetMapping("/voucher-statuses")
    public ResponseEntity<List<VoucherStatus>> getAllVoucherStatuses() {
        List<VoucherStatus> statuses = voucherService.findAllStatuses();
        return ResponseEntity.ok(statuses);
    }

    // --- FIX 2 ---
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    @GetMapping("/voucher-types")
    public ResponseEntity<List<VoucherType>> getAllVoucherTypes() {
        List<VoucherType> types = voucherService.findAllTypes();
        return ResponseEntity.ok(types);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/search")
    public ResponseEntity<VoucherDTO> findVoucherByCode(@RequestParam("code") String voucherCode) {
        return voucherService.findVoucherByCode(voucherCode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Voucher with code {} not found.", voucherCode);
                    return ResponseEntity.notFound().build();
                });
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @DeleteMapping("/{voucherId}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable int voucherId) {
        voucherService.deleteVoucher(voucherId);
        logger.info("Deleted voucher ID {}", voucherId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-usage")
    public ResponseEntity<Boolean> checkUsage(
            @RequestParam("userId") String userId,
            @RequestParam("voucherCode") String voucherCode) {
        Optional<VoucherDTO> voucherOpt = voucherService.findVoucherByCode(voucherCode);
        if (voucherOpt.isEmpty()) {
            logger.warn("Voucher code {} not found for user {}", voucherCode, userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(true);
        }
        Boolean used = voucherService.checkVoucherUsage(userId, voucherCode);
        return ResponseEntity.ok(used);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/{voucherId}/users")
    public ResponseEntity<?> addUsersToVoucher(@PathVariable Integer voucherId, @RequestBody List<String> userIds) {
        try {
            voucherService.addUsersToVoucher(userIds, voucherId);
            return ResponseEntity.status(HttpStatus.CREATED).body("Users added to voucher.");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @DeleteMapping("/{voucherId}/users")
    public ResponseEntity<?> removeUserFromVoucher(@PathVariable Integer voucherId, @RequestParam String userId) {
        voucherService.removeUserFromVoucher(userId, voucherId);
        return ResponseEntity.ok("Remove successfully");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping("/{voucherId}/users")
    public ResponseEntity<Map<String, Object>> getUsersByVoucherId(@PathVariable Integer voucherId) {
        Map<String, Object> usersInfo = voucherService.getUsersByVoucherId(voucherId);
        return ResponseEntity.ok(usersInfo);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/me")
    public ResponseEntity<Page<VoucherDTO>> getMyVouchers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer typeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        String userId = userService.getUserInfoByUsername(currentUsername).getUserId();

        Page<VoucherDTO> userVouchers = voucherService.getVouchersForUser(
                userId, search, statusId, typeId, page, size, sortBy, sortOrder
        );

        return ResponseEntity.ok(userVouchers);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/me/{voucherId}")
    public ResponseEntity<VoucherDTO> getMyVoucherById(@PathVariable int voucherId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        String userId = userService.getUserInfoByUsername(currentUsername).getUserId();

        return voucherService.getVoucherForUserById(voucherId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/check-user-voucher")
    public ResponseEntity<?> checkUserVoucher(@RequestParam("voucher") String voucherCode, @RequestParam("total") BigDecimal subTotal) {
        return voucherService.checkUserVoucher(voucherCode, subTotal);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/check-code")
    public ResponseEntity<Boolean> checkVoucherCodeExists(@RequestParam("code") String voucherCode) {
        boolean exists = voucherService.isVoucherCodeExists(voucherCode);
        return ResponseEntity.ok(exists);
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/best-for-checkout")
    public ResponseEntity<List<VoucherDTO>> getBestVouchersForCheckout(@RequestParam("total") BigDecimal cartTotal) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        String userId = userService.getUserInfoByUsername(currentUsername).getUserId();

        List<VoucherDTO> bestVouchers = voucherService.getBestVouchersForCheckout(userId, cartTotal);
        return ResponseEntity.ok(bestVouchers);
    }


}