package com.unleashed.rest;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.dto.*;
import com.unleashed.entity.Product;
import com.unleashed.entity.Variation;
import com.unleashed.repo.ProductRepository;
import com.unleashed.repo.SizeRepository;
import com.unleashed.repo.StockVariationRepository;
import com.unleashed.repo.VariationRepository;
import com.unleashed.service.BrandService;
import com.unleashed.service.CategoryService;
import com.unleashed.service.ProductService;
import com.unleashed.util.Views;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductRestController {
    private final ProductService productService;

    @Autowired
    public ProductRestController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping()
    public ResponseEntity<Page<ProductListDTO>> findProducts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "rating", required = false, defaultValue = "0") float rating,
            @RequestParam(value = "priceOrder", required = false) String priceOrder,
            @RequestParam(value = "inStockOnly", required = false, defaultValue = "false") boolean inStockOnly,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductListDTO> productPage = productService.findProductsWithFilters(query, category, brand, rating, priceOrder, inStockOnly, pageable);
        return ResponseEntity.ok(productPage);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<VariationImportDTO>> getAllVariations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer stockId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("product.productName").ascending());
        // Pass the new stockId parameter to the service
        Page<VariationImportDTO> result = productService.findAllVariationsForImport(search, stockId, pageable);
        return ResponseEntity.ok(result);
    }


    @GetMapping("/{productId}/detail")
    public ResponseEntity<ProductDetailDTO> getProductsById(@PathVariable String productId) {
        ProductDetailDTO dto = productService.getProductDetailById(productId);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/{productId}/product-variations")
    @JsonView(Views.ProductView.class)
    public ResponseEntity<?> getProductVariationsByProductId(@PathVariable String productId) {
        List<Variation> availableVariations = productService.getAvailableVariationsForProduct(productId);

        if (availableVariations != null) {
            return ResponseEntity.ok(availableVariations);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductItemByProductId(@PathVariable String productId) {
        ProductItemDTO product = productService.findProductItemById(productId);
        if (product != null) {
            return ResponseEntity.ok().body(product);
        }
        return ResponseEntity.status(404).body("Product not found!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/{productId}/product-variations")
    public ResponseEntity<Product> addProductVariations(
            @PathVariable("productId") String productId,
            @RequestBody List<ProductDTO.ProductVariationDTO> variationDTOs) {

        Product product = productService.addVariationsToExistingProduct(productId, variationDTOs);
        //System.out.println(product);
        return ResponseEntity.ok(product);
    }


    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody ProductDTO productDTO) {
        //System.out.println(productDTO);
        Product product = productService.addProduct(productDTO);
        return ResponseEntity.ok(product);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PutMapping("/{id}")
    public Product updateProduct(@RequestBody ProductDTO productDTO, @PathVariable String id) {
        productDTO.setProductId(id);
        //System.out.println(productDTO);
        return productService.updateProduct(productDTO, id);

    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
    }

    @GetMapping("/search") // Endpoint tìm kiếm sản phẩm
    public ResponseEntity<Page<ProductListDTO>> searchProducts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "1000") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductListDTO> productPage = productService.searchProducts(query, pageable);
        return ResponseEntity.ok(productPage);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping("/in-stock")
    public ResponseEntity<List<ProductDetailDTO>> getProductsInStock() {
        List<ProductDetailDTO> productsInStock = productService.getProductsInStock();
        return ResponseEntity.ok(productsInStock);
    }




}
