package com.unleashed.service;

import com.unleashed.dto.ProductDTO;
import com.unleashed.entity.Variation;
import com.unleashed.repo.ColorRepository;
import com.unleashed.repo.SizeRepository;
import com.unleashed.repo.VariationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductVariationService {
    private final VariationRepository variationRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;

    @Autowired
    public ProductVariationService(VariationRepository variationRepository, ColorRepository colorRepository, SizeRepository sizeRepository) {
        this.variationRepository = variationRepository;
        this.colorRepository = colorRepository;
        this.sizeRepository = sizeRepository;
    }

    public Variation findById(int id) {
        return variationRepository.findById(id).orElse(null);
    }

    @Transactional
    public boolean deleteById(int id) {
        if (variationRepository.existsById(id)) {
            variationRepository.deleteById(id);
            return true;
        }
        return false;
    }


    @Transactional
    public Variation updateProductVariation(int variationId, ProductDTO.ProductVariationDTO variationDTO) {
        Variation variation = variationRepository.findById(variationId).orElseThrow(() -> new ResourceNotFoundException("Product Variation not found"));

        variation.setSize(sizeRepository.findById(variationDTO.getSizeId()).orElse(null));
        variation.setColor(colorRepository.findById(variationDTO.getColorId()).orElse(null));
        variation.setVariationPrice(variationDTO.getProductPrice());
        variation.setVariationImage(variationDTO.getProductVariationImage());

        return variationRepository.save(variation);
    }
}
