package com.unleashed.rest;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.dto.StockDetailDTO;
import com.unleashed.dto.StockInfoDTO;
import com.unleashed.entity.Stock;
import com.unleashed.service.StockService;
import com.unleashed.util.Views;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockRestController {

    private final StockService stockService;

    @Autowired
    public StockRestController(StockService stockService) {
        this.stockService = stockService;
    }

    // CREATE - Admin and Staff
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock) {
        Stock createdStock = stockService.create(stock);
        return ResponseEntity.ok(createdStock);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/info/{id}")
    public ResponseEntity<StockInfoDTO> getStockInfoById(@PathVariable int id) {
        StockInfoDTO stockInfo = stockService.findInfoById(id)
                .map(stock -> new StockInfoDTO(stock.getStockName(), stock.getStockAddress()))
                .orElseThrow(() -> new EntityNotFoundException("Stock not found with id: " + id));
        return ResponseEntity.ok(stockInfo);
    }

    // READ ALL - Admin and Staff
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping
    @JsonView(Views.ListView.class)
    public List<Stock> getStocks() {
        return stockService.findAll();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Page<StockDetailDTO>> getStockById(
            @PathVariable int id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "false") boolean isLowStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Sort sort;
        if (categoryId != null) {
            sort = Sort.by("id.variationId").ascending();
        } else {
            sort = Sort.by("variation.product.productName").ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<StockDetailDTO> stockDetailsPage = stockService.findPaginatedStockDetails(id, search, brandId, categoryId, isLowStock, pageable);

        return ResponseEntity.ok(stockDetailsPage);
    }

    // UPDATE - Admin and Staff
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Stock> updateStock(@PathVariable int id, @RequestBody Stock stockDetails) {
        Stock updatedStock = stockService.update(id, stockDetails);
        return ResponseEntity.ok(updatedStock);
    }

    // DELETE - Admin and Staff
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteStock(@PathVariable int id) {
        stockService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}