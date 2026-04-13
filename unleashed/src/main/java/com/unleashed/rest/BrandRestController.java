package com.unleashed.rest;

import com.unleashed.dto.BrandDTO;
import com.unleashed.entity.Brand;
import com.unleashed.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandRestController {

    @Autowired
    private BrandService brandService;

    public BrandRestController(BrandService brandService) {
        this.brandService = brandService;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{brandId}")
    public ResponseEntity<?> deleteBrand(@PathVariable int brandId) {
        try {
            boolean isDeleted = brandService.deleteBrand(brandId);
            if (isDeleted) {
                return ResponseEntity.ok("Brand with ID " + brandId + " has been successfully deleted.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot delete brand because it has linked products.");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete brand.");
        }
    }


    @PreAuthorize("permitAll()")
    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        List<BrandDTO> brands = brandService.getAllBrandsWithQuantity();
        return ResponseEntity.ok(brands);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping("/{brandId}")
    public ResponseEntity<Brand> getBrandById(@PathVariable int brandId) {
        Brand brand = brandService.findById(brandId);
        if (brand != null) {
            return ResponseEntity.ok(brand);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
//
//    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
//    @GetMapping("/search")
//    public ResponseEntity<List<SearchBrandDTO>> getAllBrand() {
//        List<SearchBrandDTO> result = brandService.getAllBrands();
//        return ResponseEntity.ok(result);
//    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createBrand(@RequestBody Brand brand) {
        try {
            Brand createdBrand = brandService.createBrand(brand);
            return ResponseEntity.ok(createdBrand);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{brandId}")
    public ResponseEntity<?> updateBrand(@RequestBody Brand updatedBrand) {
        try {
            Brand savedBrand = brandService.updateBrand(updatedBrand);
            return ResponseEntity.ok(savedBrand);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
