package com.unleashed.rest;

import com.unleashed.dto.ProductDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.Variation;
import com.unleashed.service.ProductVariationService;
import com.unleashed.service.StockVariationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/product-variations")
public class ProductVariationRestController {
    private final ProductVariationService productVariationService;
    private final StockVariationService stockVariationService;


    @Autowired
    public ProductVariationRestController(ProductVariationService productVariationService, StockVariationService stockVariationService) {
        this.productVariationService = productVariationService;
        this.stockVariationService = stockVariationService;
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @DeleteMapping("/{variationid}")
    public ResponseEntity<ResponseDTO> deleteProductVariation(@PathVariable int variationid) {
        ResponseDTO responseDTO = stockVariationService.manageStockForVariationDeletion(variationid);
        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Variation> getProductVariation(@PathVariable int id) {
        return ResponseEntity.ok(productVariationService.findById(id));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{variationId}")
    public ResponseEntity<Variation> updateProductVariation(
            @PathVariable int variationId,
            @RequestBody ProductDTO.ProductVariationDTO variationDTO) {
        Variation updatedVariation = productVariationService.updateProductVariation(variationId, variationDTO);
        return ResponseEntity.ok(updatedVariation);
    }
}