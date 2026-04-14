package com.unleashed.service;

import com.unleashed.entity.Size;
import com.unleashed.repo.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SizeService {

    private final SizeRepository sizeRepository;

    @Autowired
    public SizeService(SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }

    public List<Size> findAll() {
        return sizeRepository.findAll();
    }
}
