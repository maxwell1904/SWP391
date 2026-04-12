package com.unleashed.rest;

import com.unleashed.entity.Color;
import com.unleashed.service.ColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
public class ColorRestController {
    private final ColorService colorService;

    @Autowired
    public ColorRestController(ColorService colorService) {
        this.colorService = colorService;
    }

    @GetMapping
    public List<Color> findAll() {
        return colorService.findAll();
    }
}