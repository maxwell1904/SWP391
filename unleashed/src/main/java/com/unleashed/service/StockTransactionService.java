package com.unleashed.service;

import com.unleashed.dto.StockTransactionDTO;
import com.unleashed.dto.TransactionCardDTO;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.StockVariationId;
import com.unleashed.repo.*;
import com.unleashed.repo.specification.TransactionSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StockTransactionService {

    private final VariationRepository variationRepository;
    private final TransactionRepository transactionRepository;
    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final StockVariationRepository stockVariationRepository;
    private final ProductStatusRepository productStatusRepository;
    private final ProviderRepository providerRepository;


    @Autowired
    public StockTransactionService(TransactionRepository transactionRepository,
                                   StockRepository stockRepository,
                                   ProductRepository productRepository,
                                   VariationRepository variationRepository,
                                   UserRepository userRepository,
                                   TransactionTypeRepository transactionTypeRepository,
                                   StockVariationRepository stockVariationRepository,
                                   ProductStatusRepository productStatusRepository,
                                   ProviderRepository providerRepository) {
        this.transactionRepository = transactionRepository;
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
        this.variationRepository = variationRepository;
        this.userRepository = userRepository;
        this.transactionTypeRepository = transactionTypeRepository;
        this.stockVariationRepository = stockVariationRepository;
        this.productStatusRepository = productStatusRepository;
        this.providerRepository = providerRepository;
    }

    @Transactional
    public boolean createStockTransactions(StockTransactionDTO stockTransactionDTO) {
        try {
            Provider provider = providerRepository.findById(stockTransactionDTO.getProviderId())
                    .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + stockTransactionDTO.getProviderId()));

            Stock stock = stockRepository.findById(stockTransactionDTO.getStockId())
                    .orElseThrow(() -> new IllegalArgumentException("Stock not found with ID: " + stockTransactionDTO.getStockId()));

            User inchargeEmployee = userRepository.findByUserUsername(stockTransactionDTO.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + stockTransactionDTO.getUsername()));

            TransactionType transactionType = transactionTypeRepository.findById(1) // Assuming 1 is for "IN"
                    .orElseThrow(() -> new IllegalStateException("Transaction Type with ID 1 not found."));

            ProductStatus newStatus = productStatusRepository.findById(5) // 5 = NEW
                    .orElseThrow(() -> new IllegalStateException("Product Status 'NEW' (ID 5) not found."));
            ProductStatus availableStatus = productStatusRepository.findById(3) // 3 = AVAILABLE
                    .orElseThrow(() -> new IllegalStateException("Product Status 'AVAILABLE' (ID 3) not found."));

            for (StockTransactionDTO.ProductVariationQuantity variationQuantity : stockTransactionDTO.getVariations()) {
                Variation variation = variationRepository.findById(variationQuantity.getProductVariationId())
                        .orElseThrow(() -> new IllegalArgumentException("Product variation not found with ID: " + variationQuantity.getProductVariationId()));

                Transaction transaction = new Transaction();
                transaction.setStock(stock);
                transaction.setVariation(variation);
                transaction.setProvider(provider);
                transaction.setInchargeEmployee(inchargeEmployee);
                transaction.setTransactionType(transactionType);
                transaction.setTransactionQuantity(variationQuantity.getQuantity());
                transactionRepository.save(transaction);

                StockVariationId stockVariationId = new StockVariationId(stock.getId(), variation.getId());
                Optional<StockVariation> existingStockVariation = stockVariationRepository.findById(stockVariationId);

                if (existingStockVariation.isPresent()) {
                    StockVariation stockVariationToUpdate = existingStockVariation.get();
                    stockVariationToUpdate.setStockQuantity(stockVariationToUpdate.getStockQuantity() + variationQuantity.getQuantity());
                    stockVariationRepository.save(stockVariationToUpdate);
                } else {
                    StockVariation newStockVariation = new StockVariation();
                    newStockVariation.setId(new StockVariationId());
                    newStockVariation.setStock(stock);
                    newStockVariation.setVariation(variation);
                    newStockVariation.setStockQuantity(variationQuantity.getQuantity());
                    stockVariationRepository.save(newStockVariation);
                }

                Product product = variation.getProduct();
                Integer currentStatusId = product.getProductStatus().getId();

                if (currentStatusId.equals(2)) {
                    product.setProductStatus(newStatus);
                }
                else if (currentStatusId.equals(1)) {
                    product.setProductStatus(availableStatus);
                }
                productRepository.save(product);
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            System.err.println("Stock import failed: " + e.getMessage());
            return false;
        }
        return true;
    }


    @Transactional(readOnly = true)
    public Map<String, Object> getTransactions(String search, String dateFilter, String sort, int page, int size) {
        Specification<Transaction> spec = new TransactionSpecification(search, dateFilter);

        // This is the key logic. The sort parameter from the frontend directly controls the query's ORDER BY clause.
        Sort sortObj = sort.equalsIgnoreCase("oldest_first")
                ? Sort.by("transactionDate").ascending()
                : Sort.by("transactionDate").descending(); // Default is newest_first

        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Transaction> transactionPage = transactionRepository.findAll(spec, pageable);

        List<TransactionCardDTO> dtos = transactionPage.getContent().stream()
                .map(this::mapEntityToCardDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("transactions", dtos);
        response.put("currentPage", transactionPage.getNumber());
        response.put("totalItems", transactionPage.getTotalElements());
        response.put("totalPages", transactionPage.getTotalPages());

        return response;
    }

    private TransactionCardDTO mapEntityToCardDTO(Transaction t) {
        if (t == null) return null;

        String categoryNameString = null;
        if (t.getVariation() != null && t.getVariation().getProduct() != null && t.getVariation().getProduct().getCategories() != null) {
            categoryNameString = t.getVariation().getProduct().getCategories().stream()
                    .map(Category::getCategoryName)
                    .collect(Collectors.joining(", "));
        }

        Variation v = t.getVariation();
        Product p = (v != null) ? v.getProduct() : null;

        return new TransactionCardDTO(
                t.getId(),
                (v != null) ? v.getVariationImage() : null,
                (p != null) ? p.getProductName() : null,
                (t.getStock() != null) ? t.getStock().getStockName() : null,
                (t.getTransactionType() != null) ? t.getTransactionType().getTransactionTypeName() : null,
                categoryNameString,
                (p != null && p.getBrand() != null) ? p.getBrand().getBrandName() : null,
                (v != null && v.getSize() != null) ? v.getSize().getSizeName() : null,
                (v != null && v.getColor() != null) ? v.getColor().getColorName() : null,
                (v != null && v.getColor() != null) ? v.getColor().getColorHexCode() : null,
                t.getTransactionProductPrice(),
                t.getTransactionQuantity(),
                t.getTransactionDate(),
                (t.getInchargeEmployee() != null) ? t.getInchargeEmployee().getUsername() : null,
                (t.getProvider() != null) ? t.getProvider().getProviderName() : null
        );
    }

    @Transactional
    public void createShippingTransactionsForOrder(Order order) {
        TransactionType outTransactionType = transactionTypeRepository.findById(2)
                .orElseThrow(() -> new IllegalStateException("Transaction Type with ID 2 (OUT) not found."));

        Map<Variation, Long> variationQuantities = order.getOrderVariationSingles().stream()
                .collect(Collectors.groupingBy(
                        ovs -> ovs.getVariationSingle().getVariation(),
                        Collectors.counting()
                ));

        for (Map.Entry<Variation, Long> entry : variationQuantities.entrySet()) {
            Variation variation = entry.getKey();
            Integer quantity = entry.getValue().intValue();

            List<StockVariation> stockLocations = stockVariationRepository.findByVariationId(variation.getId());
            if (stockLocations.isEmpty()) {
                System.err.println("Warning: No stock location found for Variation ID: " + variation.getId() + ". Cannot create OUT transaction.");
                continue;
            }
            Stock stock = stockLocations.get(0).getStock();

            Transaction transaction = new Transaction();
            transaction.setVariation(variation);
            transaction.setTransactionQuantity(quantity);
            transaction.setTransactionType(outTransactionType);
            transaction.setStock(stock);
            transaction.setInchargeEmployee(order.getInchargeEmployee());
            transaction.setProvider(null);

            transactionRepository.save(transaction);
        }
    }


    @Transactional
    public void createReservationTransactionsForOrder(Order order) {
        TransactionType outTransactionType = transactionTypeRepository.findById(2)
                .orElseThrow(() -> new IllegalStateException("Transaction Type with ID 2 (OUT) not found."));

        Map<Variation, Long> variationQuantities = order.getOrderVariationSingles().stream()
                .collect(Collectors.groupingBy(
                        ovs -> ovs.getVariationSingle().getVariation(),
                        Collectors.counting()
                ));

        for (Map.Entry<Variation, Long> entry : variationQuantities.entrySet()) {
            Variation variation = entry.getKey();
            Integer quantity = entry.getValue().intValue();

            // Find a stock location to pull from
            List<StockVariation> stockLocations = stockVariationRepository.findByVariationId(variation.getId());
            if (stockLocations.isEmpty()) {
                System.err.println("Warning: No stock location found for Variation ID: " + variation.getId() + ". Cannot create OUT transaction or reduce stock.");
                continue;
            }
            Stock stock = stockLocations.get(0).getStock();
            StockVariation stockToUpdate = stockLocations.get(0);

            // 1. Create the audit transaction
            Transaction transaction = new Transaction();
            transaction.setVariation(variation);
            transaction.setTransactionQuantity(quantity);
            transaction.setTransactionType(outTransactionType);
            transaction.setStock(stock);
            // At creation, no staff is assigned yet. You could assign the user or leave null.
            transaction.setInchargeEmployee(null);
            transaction.setProvider(null);
            transactionRepository.save(transaction);

            // 2. Update the actual stock quantity
            stockToUpdate.setStockQuantity(stockToUpdate.getStockQuantity() - quantity);
            stockVariationRepository.save(stockToUpdate);
        }
    }


    @Transactional
    public void createReturnTransactionsForOrder(Order order) {
        TransactionType inTransactionType = transactionTypeRepository.findById(1)
                .orElseThrow(() -> new IllegalStateException("Transaction Type with ID 1 (IN) not found."));

        Map<Variation, Long> variationQuantities = order.getOrderVariationSingles().stream()
                .collect(Collectors.groupingBy(
                        ovs -> ovs.getVariationSingle().getVariation(),
                        Collectors.counting()
                ));

        for (Map.Entry<Variation, Long> entry : variationQuantities.entrySet()) {
            Variation variation = entry.getKey();
            Integer quantity = entry.getValue().intValue();

            List<StockVariation> stockLocations = stockVariationRepository.findByVariationId(variation.getId());
            if (stockLocations.isEmpty()) {
                System.err.println("Warning: No stock location found for Variation ID: " + variation.getId() + ". Cannot create IN transaction or return stock.");
                continue;
            }
            Stock stock = stockLocations.get(0).getStock();
            StockVariation stockToUpdate = stockLocations.get(0);

            // 1. Create the audit transaction
            Transaction transaction = new Transaction();
            transaction.setVariation(variation);
            transaction.setTransactionQuantity(quantity);
            transaction.setTransactionType(inTransactionType);
            transaction.setStock(stock);
            // Assign the staff member who processed the order, if available
            transaction.setInchargeEmployee(order.getInchargeEmployee());
            transaction.setProvider(null); // Not a provider return
            transactionRepository.save(transaction);

            // 2. Update the actual stock quantity
            stockToUpdate.setStockQuantity(stockToUpdate.getStockQuantity() + quantity);
            stockVariationRepository.save(stockToUpdate);
        }
    }














}