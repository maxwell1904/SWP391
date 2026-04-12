package com.unleashed.rest;

import com.unleashed.dto.DiscountDTO;
import com.unleashed.entity.DiscountStatus;
import com.unleashed.entity.DiscountType;
import com.unleashed.service.DiscountService;
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
@RequestMapping("/api/discounts")
public class DiscountRestController {

    private static final Logger logger = LoggerFactory.getLogger(DiscountRestController.class);
    private final DiscountService discountService;
    private final UserService userService;

    @Autowired
    public DiscountRestController(DiscountService discountService, UserService userService) {
        this.discountService = discountService;
        this.userService = userService;
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping
    public ResponseEntity<?> createDiscount(@RequestBody DiscountDTO discountDTO) {
        try {
            DiscountDTO createdDiscount = discountService.addDiscount(discountDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDiscount);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/{discountId}")
    public ResponseEntity<DiscountDTO> getDiscountById(@PathVariable int discountId) {
        return discountService.getDiscountById(discountId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Discount ID {} not found.", discountId);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                });
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{discountId}")
    public ResponseEntity<DiscountDTO> updateDiscount(
            @PathVariable Integer discountId,
            @RequestBody DiscountDTO discountDTO) {
        return discountService.updateDiscount(discountId, discountDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Discount ID {} not found for update.", discountId);
                    return ResponseEntity.notFound().build();
                });
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping
    public ResponseEntity<Page<DiscountDTO>> getAllDiscounts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer typeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "discountId"));
        Page<DiscountDTO> discounts = discountService.getAllDiscounts(search, statusId, typeId, pageable);
        return ResponseEntity.ok(discounts);
    }

    // --- FIX 1 ---
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    @GetMapping("/discount-statuses")
    public ResponseEntity<List<DiscountStatus>> getAllDiscountStatuses() {
        List<DiscountStatus> statuses = discountService.findAllStatuses();
        return ResponseEntity.ok(statuses);
    }

    // --- FIX 2 ---
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    @GetMapping("/discount-types")
    public ResponseEntity<List<DiscountType>> getAllDiscountTypes() {
        List<DiscountType> types = discountService.findAllTypes();
        return ResponseEntity.ok(types);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/search")
    public ResponseEntity<DiscountDTO> findDiscountByCode(@RequestParam("code") String discountCode) {
        return discountService.findDiscountByCode(discountCode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Discount with code {} not found.", discountCode);
                    return ResponseEntity.notFound().build();
                });
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @DeleteMapping("/{discountId}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable int discountId) {
        discountService.deleteDiscount(discountId);
        logger.info("Deleted discount ID {}", discountId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-usage")
    public ResponseEntity<Boolean> checkUsage(
            @RequestParam("userId") String userId,
            @RequestParam("discountCode") String discountCode) {
        Optional<DiscountDTO> discountOpt = discountService.findDiscountByCode(discountCode);
        if (discountOpt.isEmpty()) {
            logger.warn("Discount code {} not found for user {}", discountCode, userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(true);
        }
        Boolean used = discountService.checkDiscountUsage(userId, discountCode);
        return ResponseEntity.ok(used);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/{discountId}/users")
    public ResponseEntity<?> addUsersToDiscount(@PathVariable Integer discountId, @RequestBody List<String> userIds) {
        try {
            discountService.addUsersToDiscount(userIds, discountId);
            return ResponseEntity.status(HttpStatus.CREATED).body("Users added to discount.");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @DeleteMapping("/{discountId}/users")
    public ResponseEntity<?> removeUserFromDiscount(@PathVariable Integer discountId, @RequestParam String userId) {
        discountService.removeUserFromDiscount(userId, discountId);
        return ResponseEntity.ok("Remove successfully");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping("/{discountId}/users")
    public ResponseEntity<Map<String, Object>> getUsersByDiscountId(@PathVariable Integer discountId) {
        Map<String, Object> usersInfo = discountService.getUsersByDiscountId(discountId);
        return ResponseEntity.ok(usersInfo);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/me")
    public ResponseEntity<Page<DiscountDTO>> getMyDiscounts(
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

        Page<DiscountDTO> userDiscounts = discountService.getDiscountsForUser(
                userId, search, statusId, typeId, page, size, sortBy, sortOrder
        );

        return ResponseEntity.ok(userDiscounts);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/me/{discountId}")
    public ResponseEntity<DiscountDTO> getMyDiscountById(@PathVariable int discountId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        String userId = userService.getUserInfoByUsername(currentUsername).getUserId();

        return discountService.getDiscountForUserById(discountId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/check-user-discount")
    public ResponseEntity<?> checkUserDiscount(@RequestParam("discount") String discountCode, @RequestParam("total") BigDecimal subTotal) {
        return discountService.checkUserDiscount(discountCode, subTotal);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/check-code")
    public ResponseEntity<Boolean> checkDiscountCodeExists(@RequestParam("code") String discountCode) {
        boolean exists = discountService.isDiscountCodeExists(discountCode);
        return ResponseEntity.ok(exists);
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/best-for-checkout")
    public ResponseEntity<List<DiscountDTO>> getBestDiscountsForCheckout(@RequestParam("total") BigDecimal cartTotal) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        String userId = userService.getUserInfoByUsername(currentUsername).getUserId();

        List<DiscountDTO> bestDiscounts = discountService.getBestDiscountsForCheckout(userId, cartTotal);
        return ResponseEntity.ok(bestDiscounts);
    }


}