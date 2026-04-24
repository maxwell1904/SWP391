package com.unleashed.service;

import com.unleashed.dto.ProductPromotionDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.PromotionProductId;
import com.unleashed.repo.*;
import com.unleashed.repo.specification.ProductSpecification;
import com.unleashed.repo.specification.PromotionSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final PromotionProductRepository promotionProductRepository;
    private final PromotionStatusRepository promotionStatusRepository;
    private final PromotionTypeRepository promotionTypeRepository;

    public PromotionService(PromotionRepository promotionRepository, ProductRepository productRepository, PromotionProductRepository promotionProductRepository, PromotionStatusRepository promotionStatusRepository, PromotionTypeRepository promotionTypeRepository) {
        this.promotionRepository = promotionRepository;
        this.productRepository = productRepository;
        this.promotionProductRepository = promotionProductRepository;
        this.promotionStatusRepository = promotionStatusRepository;
        this.promotionTypeRepository = promotionTypeRepository;
    }

    /**
     * This is the main "self-healing" method that the scheduler will run.
     * It finds and updates the status of promotions that need to be activated or expired.
     * It is transactional, so if any part fails, all changes are rolled back.
     */
    @Transactional
    public void performScheduledStatusUpdates() {
        updatePromotionsToActive();
        updatePromotionsToExpired();
    }




    @Transactional
    public List<Promotion> findAll() {
        List<Promotion> promotionList = promotionRepository.findAllByOrderByIdDesc();
        PromotionStatus expiredeStaus = promotionStatusRepository.getReferenceById(3);
        PromotionStatus inactiveStatus = promotionStatusRepository.getReferenceById(1);
        OffsetDateTime nowDate = OffsetDateTime.now();
        promotionList.forEach(promotion -> {
            if (promotion.getPromotionEndDate().isBefore(nowDate)) {
                promotion.setPromotionStatus(expiredeStaus);
            } else if (promotion.getPromotionStatus().getId().equals(expiredeStaus.getId())) {
                promotion.setPromotionStatus(inactiveStatus);
                promotionRepository.save(promotion);
            }
        });
        promotionRepository.saveAll(promotionList);
        return promotionList;
    }

    @Transactional(readOnly = true)
    public Page<Promotion> getPromotions(String search, String statusFilter, Pageable pageable) {
        // First, update all promotion statuses based on their end dates
        updateExpiredPromotionStatuses();

        Specification<Promotion> spec = new PromotionSpecification(search, statusFilter);
        return promotionRepository.findAll(spec, pageable);
    }

    @Transactional // Make this transactional as it can now perform deletions
    public Page<ProductPromotionDTO> getProductsInPromotion(int promotionId, String search, Pageable pageable) {
        // --- SELF-HEALING LOGIC ---
        // 1. Get all products currently associated with the promotion
        List<PromotionProduct> currentPromotionProducts = promotionProductRepository.findByIdPromotionId(promotionId);
        List<PromotionProduct> productsToRemove = new ArrayList<>();
        List<String> validProductIds = new ArrayList<>();

        // 2. Check stock for each product
        for (PromotionProduct sp : currentPromotionProducts) {
            Integer totalStock = productRepository.findTotalStockForProduct(sp.getId().getProductId());
            if (totalStock == null || totalStock <= 0) {
                // If stock is zero or null, mark it for removal
                productsToRemove.add(sp);
            } else {
                // Otherwise, it's valid to be shown
                validProductIds.add(sp.getId().getProductId().toString());
            }
        }

        // 3. Perform the removal from the promotion
        if (!productsToRemove.isEmpty()) {
            promotionProductRepository.deleteAll(productsToRemove);
        }
        // --- END OF SELF-HEALING LOGIC ---

        // 4. Build the final query based only on the valid, in-stock products
        Specification<Product> spec = Specification
                .where(ProductSpecification.inProductIds(validProductIds))
                .and(ProductSpecification.hasNameLike(search));

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(ProductPromotionDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ProductPromotionDTO> getProductsNotInPromotion(int promotionId, String search, Pageable pageable) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.isNotInAnyPromotion())
                .and(ProductSpecification.hasNameLike(search))
                .and(ProductSpecification.hasStock());

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(ProductPromotionDTO::fromEntity);
    }

    // A helper method to keep status logic reusable
    private void updateExpiredPromotionStatuses() {
        List<Promotion> allPromotions = promotionRepository.findAll();
        PromotionStatus expiredStatus = promotionStatusRepository.findById(3).orElse(null); // Assuming 3 is EXPIRED
        PromotionStatus activeStatus = promotionStatusRepository.findById(2).orElse(null); // Assuming 2 is ACTIVE
        OffsetDateTime now = OffsetDateTime.now();

        List<Promotion> promotionsToUpdate = new ArrayList<>();
        for (Promotion promotion : allPromotions) {
            boolean needsUpdate = false;
            // If the promotion is expired but its status is not 'EXPIRED'
            if (promotion.getPromotionEndDate().isBefore(now) && !promotion.getPromotionStatus().getId().equals(expiredStatus.getId())) {
                promotion.setPromotionStatus(expiredStatus);
                needsUpdate = true;
            }
            // If the promotion is NOT expired but its status is 'EXPIRED' (e.g., date was edited)
            if (promotion.getPromotionEndDate().isAfter(now) && promotion.getPromotionStartDate().isBefore(now) && promotion.getPromotionStatus().getId().equals(expiredStatus.getId())) {
                promotion.setPromotionStatus(activeStatus);
                needsUpdate = true;
            }

            if (needsUpdate) {
                promotionsToUpdate.add(promotion);
            }
        }
        if (!promotionsToUpdate.isEmpty()) {
            promotionRepository.saveAll(promotionsToUpdate);
        }
    }


    /**
     * Creates a new Promotion, automatically setting its initial status based on its start and end dates.
     * A promotion is 'ACTIVE' if its start date is in the past or present, and its end date is in the future or present.
     * Otherwise, it is 'INACTIVE'.
     *
     * @param promotion The promotion object to be created. Must not be null.
     * @return The persisted Promotion entity with its status correctly set.
     * @throws IllegalArgumentException if the promotion object is null.
     * @throws EntityNotFoundException if the required 'ACTIVE' or 'INACTIVE' statuses are not found in the database.
     */
    @Transactional
    public Promotion createPromotion(Promotion promotion) {
        if (promotion == null) {
            throw new IllegalArgumentException("Promotion data must not be null");
        }

        // Use a single, consistent timestamp for the entire operation
        final OffsetDateTime now = OffsetDateTime.now();

        // Set the creation timestamp for auditing
        promotion.setPromotionCreatedAt(now);

        // Encapsulate the status logic in a private helper method for clarity
        setInitialPromotionStatus(promotion, now);

        return promotionRepository.save(promotion);
    }

    /**
     * A private helper method to determine and set the correct initial status of a promotion.
     * This centralizes the business logic for new promotions.
     *
     * @param promotion The promotion entity to be updated.
     * @param now The consistent timestamp for the creation event.
     */
    private void setInitialPromotionStatus(Promotion promotion, OffsetDateTime now) {
        PromotionStatus activeStatus = promotionStatusRepository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: ACTIVE status (ID 2) not found in database."));

        PromotionStatus inactiveStatus = promotionStatusRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: INACTIVE status (ID 1) not found in database."));

        boolean isAlreadyStarted = !promotion.getPromotionStartDate().isAfter(now);
        boolean isNotYetEnded = !promotion.getPromotionEndDate().isBefore(now);

        if (isAlreadyStarted && isNotYetEnded) {
            promotion.setPromotionStatus(activeStatus);
        } else {
            promotion.setPromotionStatus(inactiveStatus);
        }
    }

    private PromotionStatus resolvePromotionStatusForDateRange(OffsetDateTime startDate, OffsetDateTime endDate, OffsetDateTime now) {
        PromotionStatus activeStatus = promotionStatusRepository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: ACTIVE status (ID 2) not found in database."));
        PromotionStatus inactiveStatus = promotionStatusRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: INACTIVE status (ID 1) not found in database."));
        PromotionStatus expiredStatus = promotionStatusRepository.findById(3)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: EXPIRED status (ID 3) not found in database."));

        if (endDate.isBefore(now)) {
            return expiredStatus;
        }

        boolean isActive = !startDate.isAfter(now) && !endDate.isBefore(now);
        return isActive ? activeStatus : inactiveStatus;
    }

    @Transactional
    public ResponseEntity<?> updatePromotion(Integer promotionId, Promotion promotionDataFromRequest) {
        // 1. Fetch the existing, managed Promotion from the database
        Promotion existingPromotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found with id: " + promotionId));

        // 2. Look up the REAL PromotionType entity from the database
        //    We get the name from the transient object sent by the frontend.
        String promotionTypeName = promotionDataFromRequest.getPromotionType().getPromotionTypeName();
        PromotionType managedPromotionType = promotionTypeRepository.findByPromotionTypeName(promotionTypeName)
                .orElseThrow(() -> new EntityNotFoundException("PromotionType not found with name: " + promotionTypeName));

        // 3. Update the existingPromotion with the managed PromotionType and other data
        existingPromotion.setPromotionType(managedPromotionType);
        existingPromotion.setPromotionValue(promotionDataFromRequest.getPromotionValue());
        existingPromotion.setPromotionStartDate(promotionDataFromRequest.getPromotionStartDate());
        existingPromotion.setPromotionEndDate(promotionDataFromRequest.getPromotionEndDate());
        existingPromotion.setPromotionStatus(
            resolvePromotionStatusForDateRange(
                promotionDataFromRequest.getPromotionStartDate(),
                promotionDataFromRequest.getPromotionEndDate(),
                OffsetDateTime.now()
            )
        );
        existingPromotion.setPromotionUpdatedAt(OffsetDateTime.now());

        Promotion updatedPromotion = promotionRepository.save(existingPromotion);

        // Using a ResponseDTO is good, but for simplicity, let's return the updated entity
        return ResponseEntity.ok(updatedPromotion);
    }

    @Transactional
    public ResponseEntity<?> deletePromotion(Integer promotionId) {
        ResponseDTO responseDTO = new ResponseDTO();
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found with id: " + promotionId));

        // Before deleting the promotion, we must delete the associations in the join table
        List<PromotionProduct> relatedProducts = promotionProductRepository.findByIdPromotionId(promotionId);
        if (!relatedProducts.isEmpty()) {
            promotionProductRepository.deleteAll(relatedProducts);
        }

        promotionRepository.delete(promotion);

        responseDTO.setMessage("Promotion " + promotionId + " deleted successfully.");
        responseDTO.setStatusCode(HttpStatus.OK.value());
        return ResponseEntity.ok(responseDTO);
    }

    @Transactional
    public ResponseEntity<?> findPromotionById(Integer promotionId) {
        ResponseDTO responseDTO = new ResponseDTO();
        Promotion promotion = promotionRepository.findById(promotionId).orElse(null);
        if (promotion == null) {
            responseDTO.setMessage("Promotion not found");
            responseDTO.setStatusCode(HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDTO);
        }

        OffsetDateTime now = OffsetDateTime.now();
        PromotionStatus expectedStatus = resolvePromotionStatusForDateRange(
                promotion.getPromotionStartDate(),
                promotion.getPromotionEndDate(),
                now
        );

        if (promotion.getPromotionStatus() == null || !promotion.getPromotionStatus().getId().equals(expectedStatus.getId())) {
            promotion.setPromotionStatus(expectedStatus);
            promotion.setPromotionUpdatedAt(now);
            promotion = promotionRepository.save(promotion);
        }

        return ResponseEntity.ok().body(promotion);
    }

    @Transactional
    public ResponseEntity<?> addProductsToPromotion(Integer promotionId, List<String> productIds) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));

        List<PromotionProduct> promotionProductsToSave = new ArrayList<>();
        for (String productIdStr : productIds) {
            UUID productId = UUID.fromString(productIdStr);
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) continue;

            PromotionProductId id = new PromotionProductId(promotionId, productId);
            PromotionProduct promotionProduct = PromotionProduct.builder()
                    .id(id)
                    .promotion(promotion)
                    .product(product)
                    .build();
            promotionProductsToSave.add(promotionProduct);
        }

        if (!promotionProductsToSave.isEmpty()) {
            promotionProductRepository.saveAll(promotionProductsToSave);
        }

        return ResponseEntity.ok().body("Products added successfully");
    }

    @Transactional
    public ResponseEntity<ResponseDTO> removeProductFromPromotion(int promotionId, String productIdStr) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            UUID productId = UUID.fromString(productIdStr);
            promotionRepository.findById(promotionId)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            PromotionProductId id = new PromotionProductId(promotionId, productId);
            Optional<PromotionProduct> existingPromotionProductOpt = promotionProductRepository.findById(id);

            if (existingPromotionProductOpt.isPresent()) {
                promotionProductRepository.delete(existingPromotionProductOpt.get());
                responseDTO.setMessage("Product removed successfully from promotion.");
                responseDTO.setStatusCode(200);
            } else {
                responseDTO.setMessage("Product not found in this promotion.");
                responseDTO.setStatusCode(404);
            }
        } catch (RuntimeException e) {
            responseDTO.setMessage(e.getMessage());
            responseDTO.setStatusCode(404);
        }
        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Product>> getProductsInPromotion(int promotionId) {
        try {
            promotionRepository.findById(promotionId)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            List<PromotionProduct> promotionProducts = promotionProductRepository.findByIdPromotionId(promotionId);

            List<Product> products = promotionProducts.stream()
                    .map(sp -> productRepository.findById(sp.getId().getProductId()).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(products);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Transactional
    public ResponseEntity<?> getListProductsInPromotions() {
        return ResponseEntity.status(HttpStatus.OK).body(promotionProductRepository.getAllProductsInPromotions());
    }


    /**
     * Finds INACTIVE promotions that should now be ACTIVE and updates them.
     */
    private void updatePromotionsToActive() {
        // Assuming your status IDs are: 1=INACTIVE, 2=ACTIVE
        PromotionStatus inactiveStatus = promotionStatusRepository.findById(1).orElse(null);
        PromotionStatus activeStatus = promotionStatusRepository.findById(2).orElse(null);

        if (inactiveStatus == null || activeStatus == null) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<Promotion> promotionsToActivate = promotionRepository.findByPromotionStatusAndPromotionStartDateBeforeAndPromotionEndDateAfter(inactiveStatus, now, now);

        if (!promotionsToActivate.isEmpty()) {

            for (Promotion promotion : promotionsToActivate) {
                promotion.setPromotionStatus(activeStatus);
            }
            promotionRepository.saveAll(promotionsToActivate);
        }
    }

    /**
     * Finds promotions that have passed their end date and marks them as EXPIRED.
     */
    private void updatePromotionsToExpired() {
        // Assuming your status ID for EXPIRED is 3
        PromotionStatus expiredStatus = promotionStatusRepository.findById(3).orElse(null);
        if (expiredStatus == null) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<Promotion> promotionsToExpire = promotionRepository.findAllByPromotionEndDateBeforeAndPromotionStatusIdNot(now, expiredStatus.getId());

        if (!promotionsToExpire.isEmpty()) {

            for (Promotion promotion : promotionsToExpire) {
                promotion.setPromotionStatus(expiredStatus);
            }
            promotionRepository.saveAll(promotionsToExpire);
        }
    }






}