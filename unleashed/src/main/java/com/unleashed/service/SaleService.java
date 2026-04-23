package com.unleashed.service;

import com.unleashed.dto.ProductSaleDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.SaleProductId;
import com.unleashed.repo.*;
import com.unleashed.repo.specification.ProductSpecification;
import com.unleashed.repo.specification.SaleSpecification;
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
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final SaleProductRepository saleProductRepository;
    private final SaleStatusRepository saleStatusRepository;
    private final SaleTypeRepository saleTypeRepository;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository, SaleProductRepository saleProductRepository, SaleStatusRepository saleStatusRepository, SaleTypeRepository saleTypeRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.saleProductRepository = saleProductRepository;
        this.saleStatusRepository = saleStatusRepository;
        this.saleTypeRepository = saleTypeRepository;
    }

    /**
     * This is the main "self-healing" method that the scheduler will run.
     * It finds and updates the status of sales that need to be activated or expired.
     * It is transactional, so if any part fails, all changes are rolled back.
     */
    @Transactional
    public void performScheduledStatusUpdates() {
        updateSalesToActive();
        updateSalesToExpired();
    }




    @Transactional
    public List<Sale> findAll() {
        List<Sale> saleList = saleRepository.findAllByOrderByIdDesc();
        SaleStatus expiredeStaus = saleStatusRepository.getReferenceById(3);
        SaleStatus inactiveStatus = saleStatusRepository.getReferenceById(1);
        OffsetDateTime nowDate = OffsetDateTime.now();
        saleList.forEach(sale -> {
            if (sale.getSaleEndDate().isBefore(nowDate)) {
                sale.setSaleStatus(expiredeStaus);
            } else if (sale.getSaleStatus().getId().equals(expiredeStaus.getId())) {
                sale.setSaleStatus(inactiveStatus);
                saleRepository.save(sale);
            }
        });
        saleRepository.saveAll(saleList);
        return saleList;
    }

    @Transactional(readOnly = true)
    public Page<Sale> getSales(String search, String statusFilter, Pageable pageable) {
        // First, update all sale statuses based on their end dates
        updateExpiredSaleStatuses();

        Specification<Sale> spec = new SaleSpecification(search, statusFilter);
        return saleRepository.findAll(spec, pageable);
    }

    @Transactional // Make this transactional as it can now perform deletions
    public Page<ProductSaleDTO> getProductsInSale(int saleId, String search, Pageable pageable) {
        // --- SELF-HEALING LOGIC ---
        // 1. Get all products currently associated with the sale
        List<SaleProduct> currentSaleProducts = saleProductRepository.findByIdSaleId(saleId);
        List<SaleProduct> productsToRemove = new ArrayList<>();
        List<String> validProductIds = new ArrayList<>();

        // 2. Check stock for each product
        for (SaleProduct sp : currentSaleProducts) {
            Integer totalStock = productRepository.findTotalStockForProduct(sp.getId().getProductId());
            if (totalStock == null || totalStock <= 0) {
                // If stock is zero or null, mark it for removal
                productsToRemove.add(sp);
            } else {
                // Otherwise, it's valid to be shown
                validProductIds.add(sp.getId().getProductId().toString());
            }
        }

        // 3. Perform the removal from the sale
        if (!productsToRemove.isEmpty()) {
            saleProductRepository.deleteAll(productsToRemove);
        }
        // --- END OF SELF-HEALING LOGIC ---

        // 4. Build the final query based only on the valid, in-stock products
        Specification<Product> spec = Specification
                .where(ProductSpecification.inProductIds(validProductIds))
                .and(ProductSpecification.hasNameLike(search));

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(ProductSaleDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ProductSaleDTO> getProductsNotInSale(int saleId, String search, Pageable pageable) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.isNotInAnySale())
                .and(ProductSpecification.hasNameLike(search))
                .and(ProductSpecification.hasStock());

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(ProductSaleDTO::fromEntity);
    }

    // A helper method to keep status logic reusable
    private void updateExpiredSaleStatuses() {
        List<Sale> allSales = saleRepository.findAll();
        SaleStatus expiredStatus = saleStatusRepository.findById(3).orElse(null); // Assuming 3 is EXPIRED
        SaleStatus activeStatus = saleStatusRepository.findById(2).orElse(null); // Assuming 2 is ACTIVE
        OffsetDateTime now = OffsetDateTime.now();

        List<Sale> salesToUpdate = new ArrayList<>();
        for (Sale sale : allSales) {
            boolean needsUpdate = false;
            // If the sale is expired but its status is not 'EXPIRED'
            if (sale.getSaleEndDate().isBefore(now) && !sale.getSaleStatus().getId().equals(expiredStatus.getId())) {
                sale.setSaleStatus(expiredStatus);
                needsUpdate = true;
            }
            // If the sale is NOT expired but its status is 'EXPIRED' (e.g., date was edited)
            if (sale.getSaleEndDate().isAfter(now) && sale.getSaleStartDate().isBefore(now) && sale.getSaleStatus().getId().equals(expiredStatus.getId())) {
                sale.setSaleStatus(activeStatus);
                needsUpdate = true;
            }

            if (needsUpdate) {
                salesToUpdate.add(sale);
            }
        }
        if (!salesToUpdate.isEmpty()) {
            saleRepository.saveAll(salesToUpdate);
        }
    }


    /**
     * Creates a new Sale, automatically setting its initial status based on its start and end dates.
     * A sale is 'ACTIVE' if its start date is in the past or present, and its end date is in the future or present.
     * Otherwise, it is 'INACTIVE'.
     *
     * @param sale The sale object to be created. Must not be null.
     * @return The persisted Sale entity with its status correctly set.
     * @throws IllegalArgumentException if the sale object is null.
     * @throws EntityNotFoundException if the required 'ACTIVE' or 'INACTIVE' statuses are not found in the database.
     */
    @Transactional
    public Sale createSale(Sale sale) {
        if (sale == null) {
            throw new IllegalArgumentException("Sale data must not be null");
        }

        // Use a single, consistent timestamp for the entire operation
        final OffsetDateTime now = OffsetDateTime.now();

        // Set the creation timestamp for auditing
        sale.setSaleCreatedAt(now);

        // Encapsulate the status logic in a private helper method for clarity
        setInitialSaleStatus(sale, now);

        return saleRepository.save(sale);
    }

    /**
     * A private helper method to determine and set the correct initial status of a sale.
     * This centralizes the business logic for new sales.
     *
     * @param sale The sale entity to be updated.
     * @param now The consistent timestamp for the creation event.
     */
    private void setInitialSaleStatus(Sale sale, OffsetDateTime now) {
        SaleStatus activeStatus = saleStatusRepository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: ACTIVE status (ID 2) not found in database."));

        SaleStatus inactiveStatus = saleStatusRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: INACTIVE status (ID 1) not found in database."));

        boolean isAlreadyStarted = !sale.getSaleStartDate().isAfter(now);
        boolean isNotYetEnded = !sale.getSaleEndDate().isBefore(now);

        if (isAlreadyStarted && isNotYetEnded) {
            sale.setSaleStatus(activeStatus);
        } else {
            sale.setSaleStatus(inactiveStatus);
        }
    }

    private SaleStatus resolveSaleStatusForDateRange(OffsetDateTime startDate, OffsetDateTime endDate, OffsetDateTime now) {
        SaleStatus activeStatus = saleStatusRepository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: ACTIVE status (ID 2) not found in database."));
        SaleStatus inactiveStatus = saleStatusRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: INACTIVE status (ID 1) not found in database."));
        SaleStatus expiredStatus = saleStatusRepository.findById(3)
                .orElseThrow(() -> new EntityNotFoundException("Critical error: EXPIRED status (ID 3) not found in database."));

        if (endDate.isBefore(now)) {
            return expiredStatus;
        }

        boolean isActive = !startDate.isAfter(now) && !endDate.isBefore(now);
        return isActive ? activeStatus : inactiveStatus;
    }

    @Transactional
    public ResponseEntity<?> updateSale(Integer saleId, Sale saleDataFromRequest) {
        // 1. Fetch the existing, managed Sale from the database
        Sale existingSale = saleRepository.findById(saleId)
                .orElseThrow(() -> new EntityNotFoundException("Sale not found with id: " + saleId));

        // 2. Look up the REAL SaleType entity from the database
        //    We get the name from the transient object sent by the frontend.
        String saleTypeName = saleDataFromRequest.getSaleType().getSaleTypeName();
        SaleType managedSaleType = saleTypeRepository.findBySaleTypeName(saleTypeName)
                .orElseThrow(() -> new EntityNotFoundException("SaleType not found with name: " + saleTypeName));

        // 3. Update the existingSale with the managed SaleType and other data
        existingSale.setSaleType(managedSaleType);
        existingSale.setSaleValue(saleDataFromRequest.getSaleValue());
        existingSale.setSaleStartDate(saleDataFromRequest.getSaleStartDate());
        existingSale.setSaleEndDate(saleDataFromRequest.getSaleEndDate());
        existingSale.setSaleStatus(
            resolveSaleStatusForDateRange(
                saleDataFromRequest.getSaleStartDate(),
                saleDataFromRequest.getSaleEndDate(),
                OffsetDateTime.now()
            )
        );
        existingSale.setSaleUpdatedAt(OffsetDateTime.now());

        Sale updatedSale = saleRepository.save(existingSale);

        // Using a ResponseDTO is good, but for simplicity, let's return the updated entity
        return ResponseEntity.ok(updatedSale);
    }

    @Transactional
    public ResponseEntity<?> deleteSale(Integer saleId) {
        ResponseDTO responseDTO = new ResponseDTO();
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new EntityNotFoundException("Sale not found with id: " + saleId));

        // Before deleting the sale, we must delete the associations in the join table
        List<SaleProduct> relatedProducts = saleProductRepository.findByIdSaleId(saleId);
        if (!relatedProducts.isEmpty()) {
            saleProductRepository.deleteAll(relatedProducts);
        }

        saleRepository.delete(sale);

        responseDTO.setMessage("Sale " + saleId + " deleted successfully.");
        responseDTO.setStatusCode(HttpStatus.OK.value());
        return ResponseEntity.ok(responseDTO);
    }

    @Transactional
    public ResponseEntity<?> findSaleById(Integer saleId) {
        ResponseDTO responseDTO = new ResponseDTO();
        Sale sale = saleRepository.findById(saleId).orElse(null);
        if (sale == null) {
            responseDTO.setMessage("Sale not found");
            responseDTO.setStatusCode(HttpStatus.NOT_FOUND.value());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDTO);
        }

        OffsetDateTime now = OffsetDateTime.now();
        SaleStatus expectedStatus = resolveSaleStatusForDateRange(
                sale.getSaleStartDate(),
                sale.getSaleEndDate(),
                now
        );

        if (sale.getSaleStatus() == null || !sale.getSaleStatus().getId().equals(expectedStatus.getId())) {
            sale.setSaleStatus(expectedStatus);
            sale.setSaleUpdatedAt(now);
            sale = saleRepository.save(sale);
        }

        return ResponseEntity.ok().body(sale);
    }

    @Transactional
    public ResponseEntity<?> addProductsToSale(Integer saleId, List<String> productIds) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new EntityNotFoundException("Sale not found"));

        List<SaleProduct> saleProductsToSave = new ArrayList<>();
        for (String productIdStr : productIds) {
            UUID productId = UUID.fromString(productIdStr);
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) continue;

            SaleProductId id = new SaleProductId(saleId, productId);
            SaleProduct saleProduct = SaleProduct.builder()
                    .id(id)
                    .sale(sale)
                    .product(product)
                    .build();
            saleProductsToSave.add(saleProduct);
        }

        if (!saleProductsToSave.isEmpty()) {
            saleProductRepository.saveAll(saleProductsToSave);
        }

        return ResponseEntity.ok().body("Products added successfully");
    }

    @Transactional
    public ResponseEntity<ResponseDTO> removeProductFromSale(int saleId, String productIdStr) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            UUID productId = UUID.fromString(productIdStr);
            saleRepository.findById(saleId)
                    .orElseThrow(() -> new RuntimeException("Sale not found"));

            productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            SaleProductId id = new SaleProductId(saleId, productId);
            Optional<SaleProduct> existingSaleProductOpt = saleProductRepository.findById(id);

            if (existingSaleProductOpt.isPresent()) {
                saleProductRepository.delete(existingSaleProductOpt.get());
                responseDTO.setMessage("Product removed successfully from sale.");
                responseDTO.setStatusCode(200);
            } else {
                responseDTO.setMessage("Product not found in this sale.");
                responseDTO.setStatusCode(404);
            }
        } catch (RuntimeException e) {
            responseDTO.setMessage(e.getMessage());
            responseDTO.setStatusCode(404);
        }
        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Product>> getProductsInSale(int saleId) {
        try {
            saleRepository.findById(saleId)
                    .orElseThrow(() -> new RuntimeException("Sale not found"));

            List<SaleProduct> saleProducts = saleProductRepository.findByIdSaleId(saleId);

            List<Product> products = saleProducts.stream()
                    .map(sp -> productRepository.findById(sp.getId().getProductId()).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(products);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Transactional
    public ResponseEntity<?> getListProductsInSales() {
        return ResponseEntity.status(HttpStatus.OK).body(saleProductRepository.getAllProductsInSales());
    }


    /**
     * Finds INACTIVE sales that should now be ACTIVE and updates them.
     */
    private void updateSalesToActive() {
        // Assuming your status IDs are: 1=INACTIVE, 2=ACTIVE
        SaleStatus inactiveStatus = saleStatusRepository.findById(1).orElse(null);
        SaleStatus activeStatus = saleStatusRepository.findById(2).orElse(null);

        if (inactiveStatus == null || activeStatus == null) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<Sale> salesToActivate = saleRepository.findBySaleStatusAndSaleStartDateBeforeAndSaleEndDateAfter(inactiveStatus, now, now);

        if (!salesToActivate.isEmpty()) {

            for (Sale sale : salesToActivate) {
                sale.setSaleStatus(activeStatus);
            }
            saleRepository.saveAll(salesToActivate);
        }
    }

    /**
     * Finds sales that have passed their end date and marks them as EXPIRED.
     */
    private void updateSalesToExpired() {
        // Assuming your status ID for EXPIRED is 3
        SaleStatus expiredStatus = saleStatusRepository.findById(3).orElse(null);
        if (expiredStatus == null) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<Sale> salesToExpire = saleRepository.findAllBySaleEndDateBeforeAndSaleStatusIdNot(now, expiredStatus.getId());

        if (!salesToExpire.isEmpty()) {

            for (Sale sale : salesToExpire) {
                sale.setSaleStatus(expiredStatus);
            }
            saleRepository.saveAll(salesToExpire);
        }
    }






}