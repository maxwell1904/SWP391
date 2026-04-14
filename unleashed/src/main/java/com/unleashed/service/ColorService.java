package com.unleashed.service;

import com.unleashed.entity.Color;
import com.unleashed.repo.ColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColorService {
    private final ColorRepository colorRepository;

    @Autowired
    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    public List<Color> findAll() {
        return colorRepository.findAll();
    }
}
