package com.unleashed.rest;

import com.unleashed.dto.ProductSaleDTO;
import com.unleashed.entity.Product;
import com.unleashed.entity.Sale;
import com.unleashed.repo.SaleRepository;
import com.unleashed.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
public class SaleRestController {

    private final SaleService saleService;

    @Autowired
    public SaleRestController(SaleService saleService, SaleRepository saleRepository) {
        this.saleService = saleService;
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllSales(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
            Page<Sale> salesPage = saleService.getSales(search, status, pageable);
            return ResponseEntity.ok(salesPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/{saleId}")
    public ResponseEntity<?> getSaleById(@PathVariable Integer saleId) {
        try {
            return saleService.findSaleById(saleId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody Sale sale) {
        try {
            return ResponseEntity.ok(saleService.createSale(sale));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PutMapping("/{saleId}")
    public ResponseEntity<?> updateSale(@PathVariable Integer saleId, @RequestBody Sale sale) {
        try {
            return saleService.updateSale(saleId, sale);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{saleId}")
    public ResponseEntity<?> deleteSale(@PathVariable Integer saleId) {
        try {
            return saleService.deleteSale(saleId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/{saleId}/products")
    public ResponseEntity<Page<ProductSaleDTO>> getProductsInSale(
                                                                   @PathVariable int saleId,
                                                                   @RequestParam(required = false) String search,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("productName").ascending());
            Page<ProductSaleDTO> products = saleService.getProductsInSale(saleId, search, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/{saleId}/products/available")
    public ResponseEntity<Page<ProductSaleDTO>> getProductsNotInSale(
                                                                      @PathVariable int saleId,
                                                                      @RequestParam(required = false) String search,
                                                                      @RequestParam(defaultValue = "0") int page,
                                                                      @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("productName").ascending());
            Page<ProductSaleDTO> products = saleService.getProductsNotInSale(saleId, search, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @PostMapping("/{saleId}/products")
    public ResponseEntity<?> addProductsToSale(@PathVariable int saleId, @RequestBody Map<String, List<String>> requestBody) {
        List<String> productIds = requestBody.get("productIds");

        // Kiểm tra danh sách productIds không rỗng
        if (productIds == null || productIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Product IDs must not be null or empty");
        }
        try {
            return saleService.addProductsToSale(saleId, productIds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @DeleteMapping("/{saleId}/products")
    public ResponseEntity<?> removeProductFromSale(@PathVariable int saleId, @RequestParam String productId) {
        try {
            return saleService.removeProductFromSale(saleId, productId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

//    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
//    @GetMapping("/{saleId}/products")
//    public ResponseEntity<?> getProductsInSale(@PathVariable int saleId) {
//        try {
//            return saleService.getProductsInSale(saleId);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/products")
    public ResponseEntity<?> getListProductInSales() {
        try {
            return saleService.getListProductsInSales();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
