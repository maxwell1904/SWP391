package com.unleashed.service;

import com.unleashed.dto.BrandDTO;
import com.unleashed.dto.SearchBrandDTO;
import com.unleashed.entity.Brand;
import com.unleashed.repo.BrandRepository;
import com.unleashed.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public List<Brand> findAll() {
        return brandRepository.findAll();
    }

    public Brand findById(int id) {
        return brandRepository.findById(id).orElse(null);
    }

    @Transactional
    public Brand createBrand(Brand brand) {
        if (brandRepository.existsByBrandName(brand.getBrandName())) {
            throw new RuntimeException("Brand already exists with name: " + brand.getBrandName());
        }
        if (brandRepository.existsByBrandWebsiteUrl(brand.getBrandWebsiteUrl())) {
            throw new RuntimeException("Brand already exists with website url: " + brand.getBrandWebsiteUrl());
        }
        if (brand.getBrandName() == null || brand.getBrandName().trim().isEmpty()) {
            throw new RuntimeException("Brand name cannot be empty");
        }
        if (brand.getBrandDescription() == null || brand.getBrandDescription().trim().isEmpty()) {
            throw new RuntimeException("Brand description cannot be empty");
        }
        if (brand.getBrandImageUrl() == null || brand.getBrandImageUrl().trim().isEmpty()) {
            throw new RuntimeException("Brand image cannot be empty");
        }
        if (brand.getBrandWebsiteUrl() == null || brand.getBrandWebsiteUrl().trim().isEmpty()) {
            throw new RuntimeException("Brand url cannot be empty");
        }
        return brandRepository.save(brand);
    }


    public List<SearchBrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(b -> new SearchBrandDTO(b.getBrandName(), b.getBrandDescription()))
                .toList();
    }

    @Transactional
    public Brand updateBrand(Brand updatedBrand) {
        return brandRepository.findById(updatedBrand.getId())
                .map(brand -> {
                    if (updatedBrand.getBrandName() == null || updatedBrand.getBrandName().trim().isEmpty()) {
                        throw new RuntimeException("Brand name cannot be null or empty");
                    }
                    if (updatedBrand.getBrandDescription() == null || updatedBrand.getBrandDescription().trim().isEmpty()) {
                        throw new RuntimeException("Brand description cannot be null or empty");
                    }
                    if (updatedBrand.getBrandImageUrl() == null || updatedBrand.getBrandImageUrl().trim().isEmpty()) {
                        throw new RuntimeException("Brand image cannot be null or empty");
                    }
                    if (updatedBrand.getBrandWebsiteUrl() == null || updatedBrand.getBrandWebsiteUrl().trim().isEmpty()) {
                        throw new RuntimeException("Brand website URL cannot be null or empty");
                    }
                    if (!brand.getBrandName().equals(updatedBrand.getBrandName()) && brandRepository.existsByBrandName(updatedBrand.getBrandName())) {
                        throw new RuntimeException("Brand already exists with name: " + updatedBrand.getBrandName());
                    }
                    if (!brand.getBrandWebsiteUrl().equals(updatedBrand.getBrandWebsiteUrl()) && brandRepository.existsByBrandWebsiteUrl(updatedBrand.getBrandWebsiteUrl())) {
                        throw new RuntimeException("Brand already exists with website URL: " + updatedBrand.getBrandWebsiteUrl());
                    }

                    brand.setBrandName(updatedBrand.getBrandName());
                    brand.setBrandDescription(updatedBrand.getBrandDescription());
                    brand.setBrandImageUrl(updatedBrand.getBrandImageUrl());
                    brand.setBrandWebsiteUrl(updatedBrand.getBrandWebsiteUrl());
                    return brandRepository.save(brand);
                })
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + updatedBrand.getId()));
    }


    public boolean deleteBrand(int brandId) {
        return brandRepository.findById(brandId)
                .map(brand -> {
                    if (productRepository.existsByBrand(brand)) {
                        throw new RuntimeException("Cannot delete brand because it has linked products.");
                    }
                    brandRepository.delete(brand);
                    return true;
                })
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<BrandDTO> getAllBrandsWithQuantity() {
        return brandRepository.findAllBrandsWithQuantity().stream()
                .map(result -> new BrandDTO(
                        ((Number) result[0]).intValue(),
                        (String) result[1], (String) result[2], (String) result[3], (String) result[4],
                        toOffsetDateTime(result[5]), toOffsetDateTime(result[6]),
                        ((Number) result[7]).longValue()
                ))
                .toList();
    }

    private OffsetDateTime toOffsetDateTime(Object timeObject) {
        if (timeObject instanceof Timestamp) {
            return ((Timestamp) timeObject).toInstant().atOffset(ZoneOffset.UTC);
        } else if (timeObject instanceof Instant) {
            return ((Instant) timeObject).atOffset(ZoneOffset.UTC);
        } else if (timeObject instanceof OffsetDateTime) {
            return (OffsetDateTime) timeObject;
        }
        return null;
    }
}
