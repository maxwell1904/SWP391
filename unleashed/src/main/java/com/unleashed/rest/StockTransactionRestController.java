package com.unleashed.rest;

import com.unleashed.dto.StockTransactionDTO;
import com.unleashed.dto.TransactionCardDTO;
import com.unleashed.service.StockTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-transactions")
public class StockTransactionRestController {
    private final StockTransactionService stockTransactionService;

    @Autowired
    public StockTransactionRestController(StockTransactionService stockTransactionService) {
        this.stockTransactionService = stockTransactionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    public ResponseEntity<Map<String, Object>> getStockTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String dateFilter,
            @RequestParam(required = false, defaultValue = "newest_first") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Map<String, Object> response = stockTransactionService.getTransactions(search, dateFilter, sort, page, size);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @PostMapping
    public ResponseEntity<String> bulkImportTransactions(
            @RequestBody StockTransactionDTO stockTransactionDTO) {
        boolean check = stockTransactionService.createStockTransactions(stockTransactionDTO);
        if (check) {
            return ResponseEntity.ok("Bulk import of stock transactions successful");
        }
        return ResponseEntity.badRequest().body("Bulk import of stock transactions failed");
    }
}
