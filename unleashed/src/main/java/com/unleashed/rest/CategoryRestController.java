package com.unleashed.rest;

import com.unleashed.dto.CategoryDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.Category;
import com.unleashed.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryRestController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryRestController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PreAuthorize("permitAll()")
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategoriesWithQuantity() {
        List<CategoryDTO> categories = categoryService.getAllCategoriesWithQuantity();
        return ResponseEntity.ok(categories);
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable int id) {
        ResponseDTO responseDTO = new ResponseDTO();
        Category category = categoryService.findById(id);
        if (category == null) {
            responseDTO.setStatusCode(HttpStatus.NO_CONTENT.value());
            responseDTO.setMessage("No category found");
            return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
        } else {
            return ResponseEntity.status(HttpStatus.OK).body(category);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO> deleteCategoryById(@PathVariable int id) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            if (categoryService.deleteCategory(id)) {
                responseDTO.setMessage("Category deleted successfully");
                responseDTO.setStatusCode(200);
                return ResponseEntity.status(200).body(responseDTO);
            } else {
                responseDTO.setStatusCode(404);
                responseDTO.setMessage("Category not found");
                return ResponseEntity.status(404).body(responseDTO);
            }
        } catch (DataIntegrityViolationException e) {
            responseDTO.setStatusCode(400);
            responseDTO.setMessage("Cannot delete category because it has linked products.");
            return ResponseEntity.status(400).body(responseDTO);
        }
    }


    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(createdCategory);
        } catch (RuntimeException e) {
            ResponseDTO responseDTO = new ResponseDTO(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDTO);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@RequestBody Category category) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Category updatedCategory = categoryService.updateCategory(category);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());
            responseDTO.setMessage(e.getMessage());
            return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
        }
    }
}
