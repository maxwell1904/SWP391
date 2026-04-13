package com.unleashed.service;

import com.unleashed.dto.StockDetailDTO;
import com.unleashed.entity.*;
import com.unleashed.repo.StockRepository;
import com.unleashed.repo.StockVariationRepository;
import com.unleashed.repo.TransactionRepository;
import com.unleashed.repo.specification.StockVariationSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StockService {
    private final StockRepository stockRepository;
    private final StockVariationRepository stockVariationRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public StockService(StockRepository stockRepository,
                        StockVariationRepository stockVariationRepository,
                        TransactionRepository transactionRepository) {
        this.stockRepository = stockRepository;
        this.stockVariationRepository = stockVariationRepository;
        this.transactionRepository = transactionRepository;
    }

    // ... create, findAll, findById, update, deleteById methods are correct and remain the same ...
    public Stock create(Stock stock) {
        return stockRepository.save(stock);
    }

    public List<Stock> findAll() {
        return stockRepository.findAll();
    }

    public Optional<Stock> findById(int id) {
        return stockRepository.findById(id);
    }

    public Optional<Stock> findInfoById(int id) {
        return stockRepository.findById(id);
    }

    public Stock update(int id, Stock stockDetails) {
        Stock existingStock = stockRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Stock not found with id: " + id));
        existingStock.setStockName(stockDetails.getStockName());
        existingStock.setStockAddress(stockDetails.getStockAddress());
        return stockRepository.save(existingStock);
    }

    @Transactional
    public void deleteById(int id) {
        if (!stockRepository.existsById(id)) {
            throw new EntityNotFoundException("Stock not found with id: " + id);
        }
        List<Transaction> relatedTransactions = transactionRepository.findByStockId(id);
        if (!relatedTransactions.isEmpty()) {
            transactionRepository.deleteAll(relatedTransactions);
        }
        List<StockVariation> relatedVariations = stockVariationRepository.findById_StockId(id);
        if (!relatedVariations.isEmpty()) {
            stockVariationRepository.deleteAll(relatedVariations);
        }
        stockRepository.deleteById(id);
    }


    // --- UPDATED getStockDetails METHOD ---
    public List<StockDetailDTO> getStockDetails(Integer stockId) {
        List<Object[]> stockData = stockRepository.findStockDetailsById(stockId);
        List<StockDetailDTO> stockDetailsList = new ArrayList<>();

        for (Object[] row : stockData) {

            // --- THE FIX IS HERE ---
            // 1. Safely cast the quantity to an Integer object.
            Integer quantity = (Integer) row[15];

            // 2. Check if the quantity is null OR less than 0 before proceeding.
            // This handles both the empty warehouse case (null) and your original logic.
            if (quantity == null || quantity < 0) {
                continue; // Skip this row entirely if there's no quantity.
            }

            StockDetailDTO stockDetails = new StockDetailDTO();

            stockDetails.setStockId((Integer) row[0]);
            stockDetails.setStockName((String) row[1]);
            stockDetails.setStockAddress((String) row[2]);
            stockDetails.setVariationId((Integer) row[3]);
            stockDetails.setProductPrice((BigDecimal) row[4]);
            stockDetails.setProductVariationImage((String) row[5]);
            stockDetails.setProductName((String) row[6]);
            stockDetails.setProductId((String) row[7]);
            stockDetails.setBrandId((Integer) row[8]);
            stockDetails.setBrandName((String) row[9]);
            stockDetails.setCategoryId((Integer) row[10]);
            stockDetails.setCategoryName((String) row[11]);
            stockDetails.setSizeName((String) row[12]);
            stockDetails.setColorName((String) row[13]);
            stockDetails.setHexCode((String) row[14]);

            // 3. Now it is safe to set the quantity.
            stockDetails.setQuantity(quantity);

            stockDetailsList.add(stockDetails);
        }

        // This check might no longer be necessary, but it's safe to keep.
        if (stockDetailsList.size() == 1 && stockDetailsList.get(0).getProductId() == null) {
            return new ArrayList<>();
        }

        return stockDetailsList;
    }

    @Transactional(readOnly = true)
    public Page<StockDetailDTO> findPaginatedStockDetails(Integer stockId, String search, Integer brandId, Integer categoryId, boolean isLowStock, Pageable pageable) {
        Specification<StockVariation> spec = new StockVariationSpecification(stockId, search, brandId, categoryId, isLowStock);
        Page<StockVariation> stockVariationPage = stockVariationRepository.findAll(spec, pageable);
        return stockVariationPage.map(this::mapStockVariationToDetailDTO);
    }

    // --- HELPER METHOD TO MAP THE ENTITY TO DTO ---
    private StockDetailDTO mapStockVariationToDetailDTO(StockVariation sv) {
        StockDetailDTO dto = new StockDetailDTO();
        Stock stock = sv.getStock();
        Variation variation = sv.getVariation();
        Product product = variation.getProduct();

        dto.setStockId(stock.getId());
        dto.setStockName(stock.getStockName());
        dto.setStockAddress(stock.getStockAddress());
        dto.setQuantity(sv.getStockQuantity());

        dto.setVariationId(variation.getId());
        dto.setProductPrice(variation.getVariationPrice());
        dto.setProductVariationImage(variation.getVariationImage());

        dto.setProductId(product.getProductId().toString());
        dto.setProductName(product.getProductName());

        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            dto.setBrandName(product.getBrand().getBrandName());
        }

        if (product.getCategories() != null && !product.getCategories().isEmpty()) {
            Category category = product.getCategories().get(0); // Assuming one category for simplicity in DTO
            dto.setCategoryId(category.getId());
            dto.setCategoryName(category.getCategoryName());
        }

        if (variation.getSize() != null) {
            dto.setSizeName(variation.getSize().getSizeName());
        }

        if (variation.getColor() != null) {
            dto.setColorName(variation.getColor().getColorName());
            dto.setHexCode(variation.getColor().getColorHexCode());
        }

        return dto;
    }


}