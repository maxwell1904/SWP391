package com.unleashed.service;

import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.Stock;
import com.unleashed.entity.StockVariation;
import com.unleashed.entity.Variation;
import com.unleashed.entity.composite.StockVariationId; // Import the Id class
import com.unleashed.repo.StockRepository;
import com.unleashed.repo.StockVariationRepository;
import com.unleashed.repo.VariationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockVariationService {

    private final StockVariationRepository stockVariationRepository;
    private final StockRepository stockRepository;
    private final VariationRepository variationRepository;

    @Autowired
    public StockVariationService(StockVariationRepository stockVariationRepository, StockRepository stockRepository, VariationRepository variationRepository) {
        this.stockVariationRepository = stockVariationRepository;
        this.stockRepository = stockRepository;
        this.variationRepository = variationRepository;
    }

    public ResponseDTO manageStockForVariationDeletion(int variationId) {
        ResponseDTO responseDTO = new ResponseDTO();

        Integer stockQuantity = stockVariationRepository.findStockProductByProductVariationId(variationId);

        if (stockQuantity == null || stockQuantity == 0) {
            Optional<Stock> stockOptional = stockRepository.findById(1);
            if (stockOptional.isEmpty()) {
                responseDTO.setStatusCode(404);
                responseDTO.setMessage("Stock with ID 1 not found");
                return responseDTO;
            }
            Stock stock = stockOptional.get();

            Optional<Variation> variationOptional = variationRepository.findById(variationId);
            if (variationOptional.isEmpty()) {
                responseDTO.setStatusCode(404);
                responseDTO.setMessage("Variation not found");
                return responseDTO;
            }
            Variation variation = variationOptional.get();

            StockVariation newStockVariation = new StockVariation();

            newStockVariation.setId(new StockVariationId());

            newStockVariation.setStock(stock);
            newStockVariation.setVariation(variation);
            newStockVariation.setStockQuantity(-1);

            stockVariationRepository.save(newStockVariation);

            responseDTO.setStatusCode(200);
            responseDTO.setMessage("No stock found, so new stock created with quantity -1");
        } else {
            List<StockVariation> stockVariations = stockVariationRepository.findByVariationId(variationId);
            if (stockVariations.isEmpty()) {
                responseDTO.setStatusCode(404);
                responseDTO.setMessage("Variation not found");
                return responseDTO;
            }

            for (StockVariation sv : stockVariations) {
                sv.setStockQuantity(-1);
            }
            stockVariationRepository.saveAll(stockVariations);

            responseDTO.setMessage("Stock quantity updated to -1 successfully");
            responseDTO.setStatusCode(200);
        }
        return responseDTO;
    }
}