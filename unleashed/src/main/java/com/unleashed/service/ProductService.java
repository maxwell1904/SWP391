package com.unleashed.service;

import com.unleashed.dto.*;
import com.unleashed.dto.mapper.ProductMapper;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.StockVariationId;
import com.unleashed.repo.*;
import com.unleashed.repo.specification.VariationSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final VariationRepository variationRepository;
    private final SizeRepository sizeRepository;
    private final ColorRepository colorRepository;
    private final PromotionProductRepository promotionProductRepository;
    private final ReviewRepository reviewRepository;
    private final StockVariationRepository stockVariationRepository; // Inject StockVariationRepository
    private final ProductStatusRepository productStatusRepository;
    private final PromotionRepository promotionRepository;
    private final ProductMapper productMapper;
    private final ReviewService reviewService;


    @Autowired
    public ProductService(ProductRepository productRepository, BrandRepository brandRepository, CategoryRepository categoryRepository, VariationRepository variationRepository, VariationRepository variationRepository1, SizeRepository sizeRepository, ColorRepository colorRepository, PromotionProductRepository promotionProductRepository, ReviewRepository reviewRepository, StockRepository stockRepository, StockVariationRepository stockVariationRepository, ProductStatusRepository productStatusRepository, PromotionRepository promotionRepository, ProductMapper productMapper, ReviewService reviewService) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.variationRepository = variationRepository;
        this.sizeRepository = sizeRepository;
        this.colorRepository = colorRepository;
        this.promotionProductRepository = promotionProductRepository;
        this.reviewRepository = reviewRepository;
        this.stockVariationRepository = stockVariationRepository; // Initialize StockVariationRepository
        this.productStatusRepository = productStatusRepository;
        this.promotionRepository = promotionRepository;
        this.productMapper = productMapper;
        this.reviewService = reviewService;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }


    @Transactional
    public void performScheduledStockUpdates() {
        // Fetch statuses
        ProductStatus outOfStock = productStatusRepository.findById(1).orElseThrow(() -> new EntityNotFoundException("Status 1 not found"));
        ProductStatus available = productStatusRepository.findById(3).orElseThrow(() -> new EntityNotFoundException("Status 3 not found"));
        ProductStatus runningOut = productStatusRepository.findById(4).orElseThrow(() -> new EntityNotFoundException("Status 4 not found"));
        ProductStatus newStatus = productStatusRepository.findById(5).orElseThrow(() -> new EntityNotFoundException("Status 5 not found"));

        // 1. Mark products as RUNNING OUT
        List<Product> productsToMarkRunningOut = productRepository.findProductsByStatusInAndStockLessThanEqual(Arrays.asList(3, 5), 100L); // AVAILABLE or NEW
        productsToMarkRunningOut.forEach(p -> p.setProductStatus(runningOut));

        // 2. Mark products as OUT OF STOCK
        List<Product> productsToMarkOutOfStock = productRepository.findProductsByStatusInAndStockLessThanEqual(Arrays.asList(3, 4, 5), 0L); // AVAILABLE, RUNNING OUT, or NEW
        productsToMarkOutOfStock.forEach(p -> p.setProductStatus(outOfStock));

        // 3. Mark restocked products as AVAILABLE
        List<Product> productsToMarkAvailable = productRepository.findProductsByStatusInAndStockGreaterThan(Collections.singletonList(1), 0L); // OUT OF STOCK
        productsToMarkAvailable.forEach(p -> p.setProductStatus(available));

        // Combine all changes and save once
        List<Product> allProductsToUpdate = new ArrayList<>();
        allProductsToUpdate.addAll(productsToMarkRunningOut);
        allProductsToUpdate.addAll(productsToMarkOutOfStock);
        allProductsToUpdate.addAll(productsToMarkAvailable);

        if (!allProductsToUpdate.isEmpty()) {
            productRepository.saveAll(allProductsToUpdate);
        }
    }


    @Transactional
    public void performScheduledAgingUpdate() {
        List<UUID> productIds = productRepository.findProductIdsToAgeFromNewToAvailable();
        if (!productIds.isEmpty()) {
            ProductStatus availableStatus = productStatusRepository.findById(3)
                    .orElseThrow(() -> new EntityNotFoundException("Status 3 not found"));
            List<Product> productsToUpdate = productRepository.findAllById(productIds);
            productsToUpdate.forEach(p -> p.setProductStatus(availableStatus));
            productRepository.saveAll(productsToUpdate);
        }
    }





    @Transactional(readOnly = true)
    public Page<VariationImportDTO> findAllVariationsForImport(String search, Integer stockId, Pageable pageable) {
        Specification<Variation> spec = new VariationSpecification(search, stockId);

        Page<Variation> variationPage = variationRepository.findAll(spec, pageable);

        Page<VariationImportDTO> dtoPage = variationPage.map(VariationImportDTO::fromEntity);

        if (stockId != null && dtoPage.hasContent()) {
            List<Integer> variationIds = dtoPage.getContent().stream()
                    .map(VariationImportDTO::getId)
                    .collect(Collectors.toList());

            List<StockVariation> stockLevels = stockVariationRepository.findById_StockIdAndId_VariationIdIn(stockId, variationIds);

            Map<Integer, Integer> stockMap = stockLevels.stream()
                    .collect(Collectors.toMap(sv -> sv.getId().getVariationId(), StockVariation::getStockQuantity));

            dtoPage.getContent().forEach(dto -> {
                dto.setCurrentStock(stockMap.getOrDefault(dto.getId(), 0));
            });
        }

        return dtoPage;
    }

    public Product findById(String id) {
        //THIS ONE IS USED TO FIND ALL VARIATIONS THAT BELONGS TO A PRODUCT
        //TO WHO THE F NAMED THESE, F YOU

//        System.out.println("ProductService.findById() is called for productId: " + id);
//        Product pro = new Product();
//        pro = productRepository.findProductWithVariations(id);
//        pro.getProductVariations().forEach(pv -> System.out.println("For ID " + id + " result is: " + pv.getColor()));
//        return productRepository.findProductWithVariations(id);
        // OLD CODE:
        //Optional<Product> pro = productRepository.findById(id);




        return productRepository.findById(UUID.fromString(id)).orElse(null);
    }


    public ProductItemDTO findProductItemById(String idi) {
        UUID id = UUID.fromString(idi);
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            return null;
        }
        Product product = productOptional.get();

        ProductItemDTO productItemDTO = new ProductItemDTO();
        productItemDTO.setProductId(id.toString());
        productItemDTO.setProductName(product.getProductName());
        productItemDTO.setDescription(product.getProductDescription());
        if (product.getBrand() != null) {
            productItemDTO.setBrand(product.getBrand());
        }
        productItemDTO.setCategories(product.getCategories());

        Integer status = productStatusRepository.findStatusByProductId(id);
        productItemDTO.setStatus(status != null ? status : 5);

        List<Variation> allVariations = variationRepository.findProductVariationByProductId(id);
        List<Variation> inStockVariations = allVariations.stream()
                .filter(variation -> {
                    Integer stock = stockVariationRepository.findStockProductByProductVariationId(variation.getId());
                    return stock != null && stock > 0;
                })
                .toList();

        Set<Size> availableSizes = new HashSet<>();
        Set<Color> availableColors = new HashSet<>();
        Map<String, Map<String, ProductVariationDTO>> variationsMap = new HashMap<>();

        for (Variation variation : inStockVariations) {
            availableColors.add(variation.getColor());
            availableSizes.add(variation.getSize());

            ProductVariationDTO variationDTO = new ProductVariationDTO();
            variationDTO.setId(variation.getId());
            variationDTO.setPrice(variation.getVariationPrice());
            variationDTO.setImages(variation.getVariationImage());
            variationDTO.setQuantity(stockVariationRepository.findStockProductByProductVariationId(variation.getId()));

            variationsMap
                    .computeIfAbsent(variation.getColor().getColorName(), k -> new HashMap<>())
                    .put(variation.getSize().getSizeName(), variationDTO);
        }

        productItemDTO.setSizes(new ArrayList<>(availableSizes));
        productItemDTO.setColors(new ArrayList<>(availableColors));
        productItemDTO.setVariations(variationsMap);

        PromotionProduct promotionProduct = promotionProductRepository.findPromotionProductByProductId(id);
        if (promotionProduct != null) {
            promotionRepository.findById(promotionProduct.getId().getPromotionId()).ifPresent(promotion -> {
                if (promotion.getPromotionType() != null) {
                    productItemDTO.setPromotionType(promotion.getPromotionType());
                    productItemDTO.setPromotionValue(promotion.getPromotionValue());
                }
            });
        }

        List<Object[]> totalRatingResult = reviewRepository.countAndAvgRatingByProductId(id);
        if (totalRatingResult != null && !totalRatingResult.isEmpty()) {
            Object[] result = totalRatingResult.get(0);
            productItemDTO.setTotalRating((long) result[0]);
            productItemDTO.setAvgRating((double) result[1]);
        } else {
            productItemDTO.setTotalRating(0L);
            productItemDTO.setAvgRating(0.0);
        }

        Pageable initialPage = PageRequest.of(0, 10);
        Page<ProductReviewDTO> reviewsPage = reviewService.getAllReviewsByProductId(id.toString(), initialPage, null);
        productItemDTO.setReviews(reviewsPage.getContent());

        return productItemDTO;
    }


    @Transactional
    public void deleteProduct(String id) {
        productRepository.softDeleteProduct(UUID.fromString(id));
    }

    @Transactional
    public Product addProduct(ProductDTO productDTO) {
        Product product = new Product();


        //System.out.println(productDTO);

        product.setProductName(productDTO.getProductName());
        product.setProductDescription(productDTO.getProductDescription());

        product.setProductStatus(productStatusRepository.findById(2)
                .orElseThrow(() -> new EntityNotFoundException("CRITICAL: Product Status 'IMPORTING' (ID 2) not found.")));

        product.setBrand(brandRepository.findById(productDTO.getBrandId()).orElse(null));
        product = productRepository.save(product);
        for (Integer categoryId : productDTO.getCategoryIdList()) {
            productRepository.addProductCategory(product.getProductId(), categoryId);
        }
//        System.out.println(productRepository);
        List<Variation> variations = new ArrayList<>();
        Set<String> uniqueVariations = new HashSet<>(); // Lưu key duy nhất của size và color

        for (ProductDTO.ProductVariationDTO variationDTO : productDTO.getVariations()) {
            String key = variationDTO.getSizeId() + "-" + variationDTO.getColorId(); // Tạo key duy nhất

            if (!uniqueVariations.contains(key)) { // Nếu chưa có thì thêm vào
                Variation variation = new Variation();
                variation.setSize(sizeRepository.findById(variationDTO.getSizeId()).orElse(null));
                variation.setColor(colorRepository.findById(variationDTO.getColorId()).orElse(null));
                variation.setVariationPrice(variationDTO.getProductPrice());
                variation.setVariationImage(variationDTO.getProductVariationImage());
                variation.setProduct(product);

                variations.add(variation);
                uniqueVariations.add(key); // Đánh dấu đã có
            }
        }


        // Save all ProductVariations to the database
        variationRepository.saveAll(variations);

        // Associate the variations with the product
//         savedProduct.setProductVariations(variations);

        return product;
    }


@Transactional
public Product updateProduct(ProductDTO productDTO, String id) {
    Optional<Product> existingProduct = productRepository.findById(UUID.fromString(id));

    if (existingProduct.isPresent()) {
        Product product = existingProduct.get();

        product.setProductDescription(productDTO.getProductDescription());
        product.setProductName(productDTO.getProductName());

        if (productDTO.getProductStatusId() != null) {
            product.setProductStatus(productDTO.getProductStatusId());
        }

        product.setBrand(brandRepository.findById(productDTO.getBrandId()).orElse(null));

        List<Integer> categoryIdList = productDTO.getCategoryIdList();
        List<Category> categories = categoryIdList.stream()
                .map(catId -> categoryRepository.findById(catId)
                        .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + catId)))
                .collect(Collectors.toList());

        product.setCategories(categories);

        return productRepository.save(product);
    } else {
        return null;
    }
}

    public List<ProductListDTO> getListProduct() {
        List<Product> result = productRepository.findAllActiveProducts();
        List<ProductListDTO> productList = new ArrayList<>();

        for (Product product : result) { // Iterate over Product entities directly

            String productId = product.getProductId().toString();

            boolean exists = productList.stream()
                    .anyMatch(dto -> dto.getProductId().equals(productId));

            //deleted == skip
            if (product.getProductStatus() == null) {
                continue;
            }


            if (!exists && !product.getProductVariations().isEmpty()) {
                ProductListDTO productListDTO = new ProductListDTO();
                productListDTO.setProductId(productId);
                productListDTO.setProductName(product.getProductName());
                productListDTO.setProductDescription(product.getProductDescription());
                productListDTO.setBrandId(product.getBrand().getId());
                productListDTO.setBrandName(product.getBrand().getBrandName());
                productListDTO.setCategoryList(new ArrayList<>(product.getCategories())); // Get categories

                // Get first variation for price and image
                List<Variation> variations = variationRepository.findProductVariationByProductId(UUID.fromString(productId));
                if (!variations.isEmpty()) {
                    Variation firstVariation = variations.get(0);
                    productListDTO.setProductPrice(firstVariation.getVariationPrice());
                    productListDTO.setProductVariationImage(firstVariation.getVariationImage());
                }

                // Get Promotion information
                List<PromotionProduct> promotionProduct = promotionProductRepository.findById_ProductId(UUID.fromString(productId));
                if (promotionProduct != null && !promotionProduct.isEmpty()) {
                    promotionProduct.forEach(sp -> {
                        Promotion promotion = promotionRepository.findById(sp.getId().getPromotionId()).orElse(null);
                        if (promotion != null && Objects.equals(promotion.getPromotionStatus().getPromotionStatusName(), "ACTIVE")) {
                            productListDTO.setPromotion(promotion); // Set the entire Promotion object if needed
                            productListDTO.setPromotionValue(promotion.getPromotionValue()); // Or just the promotionValue
                        }
                    });

                }

                // Get average rating and total ratings
                List<Object[]> ratingData = reviewRepository.countAndAvgRatingByProductId(UUID.fromString(productId));
                if (!ratingData.isEmpty() && ratingData.get(0) != null) { // Check for null and empty
                    Object[] ratingResult = ratingData.get(0);
                    productListDTO.setTotalRatings((Long) ratingResult[0]);
                    productListDTO.setAverageRating((Double.parseDouble(String.format("%.2f",(Double) ratingResult[1]))));
                } else {
                    productListDTO.setTotalRatings(0L); // Default to 0 if no ratings
                    productListDTO.setAverageRating(0.0); // Default to 0.0 if no ratings
                }


                // Calculate total quantity for the product (already implemented)
                Integer totalQuantity = stockVariationRepository.getTotalStockQuantityForProduct(UUID.fromString(productId));
                productListDTO.setQuantity(totalQuantity != null ? totalQuantity : 0);

                productList.add(productListDTO);
            }
        }

        return productList;
    }

    @Transactional
    public Product addVariationsToExistingProduct(String productId, List<ProductDTO.ProductVariationDTO> variationDTOs) {
        Product product = productRepository.findById(UUID.fromString(productId))
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        List<Variation> existingVariations = product.getProductVariations(); // Lấy danh sách biến thể hiện có
        List<Variation> newVariations = new ArrayList<>();

        for (ProductDTO.ProductVariationDTO variationDTO : variationDTOs) {
            Size size = sizeRepository.findById(variationDTO.getSizeId()).orElse(null);
            Color color = colorRepository.findById(variationDTO.getColorId()).orElse(null);

            // Kiểm tra xem biến thể đã tồn tại chưa
            boolean exists = existingVariations.stream().anyMatch(v ->
                    v.getSize().equals(size) && v.getColor().equals(color)
            );

            if (!exists) {
                Variation variation = new Variation();
                variation.setSize(size);
                variation.setColor(color);
                variation.setVariationPrice(variationDTO.getProductPrice());
                variation.setVariationImage(variationDTO.getProductVariationImage());
                variation.setProduct(product);
                newVariations.add(variation);
            }
        }

        // Chỉ lưu các biến thể mới vào cơ sở dữ liệu
        if (!newVariations.isEmpty()) {
            variationRepository.saveAll(newVariations);
            product.getProductVariations().addAll(newVariations);
            return productRepository.save(product);
        }

        return product;
    }

    public Page<ProductListDTO> searchProducts(String query, Pageable pageable) { // Return Page<ProductListDTO>
        Page<Object[]> productPageResult = productRepository.searchProducts(query, pageable);
        return productPageResult.map(result -> {
            Product product = (Product) result[0];
            Variation firstVariation = (Variation) result[1];
            Double averageRating = (Double) result[2]; // Lấy averageRating từ result array
            Long totalRatings = (Long) result[3];   // Lấy totalRatings từ result array

            ProductListDTO productListDTO = new ProductListDTO(); // **Tạo ProductListDTO mới thủ công**
            // Map các fields từ Product entity vào ProductListDTO (bằng tay hoặc dùng mapper)
            productListDTO.setProductId(product.getProductId().toString());
            productListDTO.setProductName(product.getProductName());
            productListDTO.setProductDescription(product.getProductDescription());

            if (firstVariation != null) {
                productListDTO.setProductPrice(firstVariation.getVariationPrice());
                productListDTO.setProductVariationImage(firstVariation.getVariationImage());
            } else {
                productListDTO.setProductPrice(BigDecimal.ZERO);
                productListDTO.setProductVariationImage(null);
            }
            productListDTO.setAverageRating(averageRating != null ? averageRating : 0.0); // Set averageRating từ query result
            productListDTO.setTotalRatings(totalRatings != null ? totalRatings : 0L);   // Set totalRatings từ query result
            return productListDTO;
        });
    }

    public List<ProductDetailDTO> getProductsInStock() {
        List<Product> products = productRepository.findProductsInStock();
        List<UUID> productIdsInPromotion = promotionProductRepository.findAllProductIdsInPromotion();
        return products.stream()
                .filter(product -> !productIdsInPromotion.contains(UUID.fromString(product.getProductId().toString())))
                .map(product -> ProductDetailDTO.builder()
                        .productId(product.getProductId().toString())
                        .productName(product.getProductName())
                        .productCode(product.getProductCode())
                        .productDescription(product.getProductDescription())
                        .productCreatedAt(product.getProductCreatedAt())
                        .productUpdatedAt(product.getProductUpdatedAt())
                        .brand(product.getBrand())
                        .productStatusId(product.getProductStatus())
                        .categories(product.getCategories())
                        .productVariations(product.getProductVariations())
                        .build())
                .collect(Collectors.toList());
    }

    public Page<ProductListDTO> findProductsWithFilters(String query, String category, String brand, float rating, String priceOrder, boolean inStockOnly, Pageable pageable) {
        Sort sort = Sort.unsorted();
        if ("asc".equalsIgnoreCase(priceOrder)) {
            sort = Sort.by("v.variationPrice").ascending();
        } else if ("desc".equalsIgnoreCase(priceOrder)) {
            sort = Sort.by("v.variationPrice").descending();
        }

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Object[]> productPageResult = productRepository.findProductsWithFilters(query, category, brand, rating, inStockOnly, sortedPageable);

        List<Integer> promotionIds = productPageResult.getContent().stream()
                .map(result -> (Integer) result[4])
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Integer, Promotion> promotionMap;
        if (!promotionIds.isEmpty()) {
            List<Promotion> promotions = promotionRepository.findAllById(promotionIds);
            promotionMap = promotions.stream().collect(Collectors.toMap(Promotion::getId, promotion -> promotion));
        } else {
            promotionMap = Collections.emptyMap();
        }

        return productPageResult.map(result -> {
            Product product = (Product) result[0];
            Variation firstVariation = (Variation) result[1];
            Double averageRating = (Double) result[2];
            Long totalRatings = (Long) result[3];
            Integer promotionId = (Integer) result[4];

            ProductListDTO dto = new ProductListDTO();
            dto.setProductId(product.getProductId().toString());
            dto.setProductName(product.getProductName());
            dto.setBrandName(product.getBrand().getBrandName());
            dto.setCategoryList(new ArrayList<>(product.getCategories()));

            if (firstVariation != null) {
                dto.setProductPrice(firstVariation.getVariationPrice());
                dto.setProductVariationImage(firstVariation.getVariationImage());
            }

            dto.setAverageRating(averageRating != null ? averageRating : 0.0);
            dto.setTotalRatings(totalRatings != null ? totalRatings : 0L);

            if (promotionId != null) {
                Promotion promotion = promotionMap.get(promotionId);
                dto.setPromotion(promotion);
                if (promotion != null) {
                    dto.setPromotionValue(promotion.getPromotionValue());
                }
            }

            Integer totalQuantity = stockVariationRepository.getTotalStockQuantityForProduct(product.getProductId());
            dto.setQuantity(totalQuantity != null ? totalQuantity : 0);

            return dto;
        });
    }

    @Transactional(readOnly = true)
    public ProductDetailDTO getProductDetailById(String productId) {
        Product product = this.findById(productId);
        if (product == null) {
            return null; // Or throw a custom NotFoundException
        }

        // Fetch available variations
        List<Variation> availableVariations = variationRepository.findProductVariationByProductId(product.getProductId());

        // Filter out variations with negative stock (business logic)
        availableVariations.removeIf(variation -> {
            Integer stock = stockVariationRepository.findStockProductByProductVariationId(variation.getId());
            return stock != null && stock < 0;
        });

        return ProductDetailDTO.builder()
                .productId(product.getProductId().toString())
                .productName(product.getProductName())
                .productCode(product.getProductCode())
                .productDescription(product.getProductDescription())
                .productStatusId(product.getProductStatus())
                .productVariations(availableVariations)
                .productCreatedAt(product.getProductCreatedAt())
                .productUpdatedAt(product.getProductUpdatedAt())
                .brand(product.getBrand())
                .categories(product.getCategories())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Variation> getAvailableVariationsForProduct(String productId) {
        Product product = this.findById(productId);
        if (product == null || product.getProductVariations() == null) {
            return null; // Indicate that the product or its variations were not found
        }

        List<Variation> availableVariations = product.getProductVariations();

        // Filter out variations with negative stock
        availableVariations.removeIf(variation -> {
            Integer stock = stockVariationRepository.findStockProductByProductVariationId(variation.getId());
            return stock != null && stock < 0;
        });

        return availableVariations;
    }

}
