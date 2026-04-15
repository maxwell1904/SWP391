package com.unleashed.Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unleashed.dto.BrandDTO;
import com.unleashed.dto.SearchBrandDTO;
import com.unleashed.entity.Brand;
import com.unleashed.service.BrandService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class BrandControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BrandService brandService;

    @Autowired
    private ObjectMapper objectMapper; // Để convert object sang JSON

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteBrand_ReturnsOk() throws Exception {
        // Khoi tao
        int brandId = 1;
        when(brandService.deleteBrand(brandId)).thenReturn(true);

        // Thuc hien request & Kiem tra
        mockMvc.perform(delete("/api/brands/{brandId}", brandId))
                .andExpect(status().isOk())
                .andExpect(content().string("Brand with ID " + brandId + " has been successfully deleted."));
        verify(brandService, times(1)).deleteBrand(brandId);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteBrand_ReturnsBadRequest_WhenDeleteFails() throws Exception {
        // Khoi tao
        int brandId = 1;
        when(brandService.deleteBrand(brandId)).thenReturn(false);

        // Thuc hien request & Kiem tra
        mockMvc.perform(delete("/api/brands/{brandId}", brandId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Cannot delete brand because it has linked products."));
        verify(brandService, times(1)).deleteBrand(brandId);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteBrand_ReturnsBadRequest_WhenRuntimeException() throws Exception {
        // Khoi tao
        int brandId = 1;
        when(brandService.deleteBrand(brandId)).thenThrow(new RuntimeException("Brand cannot be deleted"));

        // Thuc hien request & Kiem tra
        mockMvc.perform(delete("/api/brands/{brandId}", brandId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Brand cannot be deleted"));
        verify(brandService, times(1)).deleteBrand(brandId);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteBrand_ReturnsInternalServerError_WhenException() throws Exception {
        // Khoi tao
        int brandId = 1;
        when(brandService.deleteBrand(brandId)).thenThrow(new RuntimeException("Failed to delete brand."));

        // Thuc hien request & Kiem tra
        mockMvc.perform(delete("/api/brands/{brandId}", brandId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Failed to delete brand."));
        verify(brandService, times(1)).deleteBrand(brandId);
    }

    @Test
    @WithMockUser
    void getAllBrands_ReturnsOk_WithBrandDTOList() throws Exception {
        // Khoi tao
        BrandDTO brandDTO1 = new BrandDTO();
        brandDTO1.setBrandId(1);
        brandDTO1.setBrandName("Brand 1");
        BrandDTO brandDTO2 = new BrandDTO();
        brandDTO2.setBrandId(2);
        brandDTO2.setBrandName("Brand 2");
        List<BrandDTO> brand = Arrays.asList(brandDTO1, brandDTO2);
        when(brandService.getAllBrandsWithQuantity()).thenReturn(brand);

        // Thuc hien request & Kiem tra
        mockMvc.perform(get("/api/brands"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].brandId").value(1))
                .andExpect(jsonPath("$[0].brandName").value("Brand 1"))
                .andExpect(jsonPath("$[1].brandId").value(2))
                .andExpect(jsonPath("$[1].brandName").value("Brand 2"));
        verify(brandService, times(1)).getAllBrandsWithQuantity();
    }

    @Test
    @WithMockUser
    void getAllBrands_ReturnsOk_WithEmptyList() throws Exception {
        // Khoi tao
        when(brandService.getAllBrandsWithQuantity()).thenReturn(Collections.emptyList());

        // Thuc hien request & Kiem tra
        mockMvc.perform(get("/api/brands"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isEmpty());
        verify(brandService, times(1)).getAllBrandsWithQuantity();
    }

    @Test
    @WithMockUser(authorities = {"ADMIN", "STAFF"})
    void getBrandById_ReturnsOk_WithBrand() throws Exception {
        // Khoi tao
        int brandId = 1;
        Brand brand = new Brand();
        brand.setId(brandId);
        brand.setBrandName("Brand 1");
        when(brandService.findById(brandId)).thenReturn(brand);

        // Thuc hien request & Kiem tra
        mockMvc.perform(get("/api/brands/{brandId}", brandId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(brandId))
                .andExpect(jsonPath("$.brandName").value("Brand 1"));
        verify(brandService, times(1)).findById(brandId);
    }

    @Test
    @WithMockUser(authorities = {"ADMIN", "STAFF"})
    void getBrandById_ReturnsNotFound() throws Exception {
        // Khoi tao
        int brandId = 1;
        when(brandService.findById(brandId)).thenReturn(null);

        // Thuc hien request & Kiem tra
        mockMvc.perform(get("/api/brands/{brandId}", brandId))
                .andExpect(status().isNotFound());
        verify(brandService, times(1)).findById(brandId);
    }

    @Test
    @WithMockUser(authorities = {"ADMIN", "STAFF"})
    void getAllBrand_ReturnsOk_WithSearchBrandDTOList() throws Exception {
        // Khoi tao
        SearchBrandDTO searchBrandDTO1 = new SearchBrandDTO("Brand 1", "Description 1");
        SearchBrandDTO searchBrandDTO2 = new SearchBrandDTO("Brand 2", "Description 2");
        List<SearchBrandDTO> searchBrandDTOs = Arrays.asList(searchBrandDTO1, searchBrandDTO2);
        when(brandService.getAllBrands()).thenReturn(searchBrandDTOs);

        // Thuc hien request & Kiem tra
        mockMvc.perform(get("/api/brands/search"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].brandName").value("Brand 1"))
                .andExpect(jsonPath("$[0].brandDescription").value("Description 1"))
                .andExpect(jsonPath("$[1].brandName").value("Brand 2"))
                .andExpect(jsonPath("$[1].brandDescription").value("Description 2"));
        verify(brandService, times(1)).getAllBrands();
    }

    @Test
    @WithMockUser(authorities = {"ADMIN", "STAFF"})
    void getAllBrand_ReturnsOk_WithEmptySearchBrandDTOList() throws Exception {
        // Khoi tao
        when(brandService.getAllBrands()).thenReturn(Collections.emptyList());

        // Thuc hien request & Kiem tra
        mockMvc.perform(get("/api/brands/search"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isEmpty());
        verify(brandService, times(1)).getAllBrands();
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void createBrand_ReturnsOk_WithCreatedBrand() throws Exception {
        // Khoi tao
        Brand brandToCreate = new Brand();
        brandToCreate.setBrandName("New Brand");
        Brand createdBrand = new Brand();
        createdBrand.setId(1);
        createdBrand.setBrandName("New Brand");
        when(brandService.createBrand(any(Brand.class))).thenReturn(createdBrand);

        // Thuc hien request & Kiem tra
        mockMvc.perform(post("/api/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(brandToCreate)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brandName").value("New Brand"));
        verify(brandService, times(1)).createBrand(any(Brand.class));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void createBrand_ReturnsBadRequest_WhenRuntimeException() throws Exception {
        // Khoi tao
        Brand brandToCreate = new Brand();
        brandToCreate.setBrandName("Existing Brand");
        when(brandService.createBrand(any(Brand.class))).thenThrow(new RuntimeException("Brand already exists"));

        // Thuc hien request & Kiem tra
        mockMvc.perform(post("/api/brands")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(brandToCreate)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Brand already exists"));
        verify(brandService, times(1)).createBrand(any(Brand.class));
    }

    @Test
    @WithMockUser(authorities = {"ADMIN", "STAFF"})
    void updateBrand_ReturnsOk_WithUpdatedBrand() throws Exception {
        // Khoi tao
        int brandId = 1;
        Brand brandToUpdate = new Brand();
        brandToUpdate.setId(brandId);
        brandToUpdate.setBrandName("Updated Brand");
        Brand updatedBrand = new Brand();
        updatedBrand.setId(brandId);
        updatedBrand.setBrandName("Updated Brand");
        when(brandService.updateBrand(any(Brand.class))).thenReturn(updatedBrand);

        // Thuc hien request & Kiem tra
        mockMvc.perform(put("/api/brands/{brandId}", brandId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(brandToUpdate)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(brandId))
                .andExpect(jsonPath("$.brandName").value("Updated Brand"));
        verify(brandService, times(1)).updateBrand(any(Brand.class));
    }

    @Test
    @WithMockUser(authorities = {"ADMIN", "STAFF"})
    void updateBrand_ReturnsBadRequest_WhenRuntimeException() throws Exception {
        // Khoi tao
        int brandId = 1;
        Brand brandToUpdate = new Brand();
        brandToUpdate.setId(brandId);
        brandToUpdate.setBrandName("Existing Brand");
        when(brandService.updateBrand(any(Brand.class))).thenThrow(new RuntimeException("Brand already exists"));

        // Thuc hien request & Kiem tra
        mockMvc.perform(put("/api/brands/{brandId}", brandId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(brandToUpdate)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Brand already exists"));
        verify(brandService, times(1)).updateBrand(any(Brand.class));
    }
}
