package com.unleashed.rest;

import com.unleashed.entity.Provider;
import com.unleashed.service.ProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderRestController {
    private final ProviderService providerService;

    public ProviderRestController(ProviderService providerService) {
        this.providerService = providerService;
    }

    @PreAuthorize("permitAll()")
    @GetMapping
    public ResponseEntity<List<Provider>> getAllProviders() {
        List<Provider> providers = providerService.getAllProviders();
        return ResponseEntity.ok(providers);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Provider> getProviderById(@PathVariable Integer id) {
        Provider provider = providerService.findById(id);
        return provider != null ? ResponseEntity.ok(provider) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createProvider(@RequestBody Provider provider) {
        try {
            Provider createdProvider = providerService.createProvider(provider);
            return ResponseEntity.ok(createdProvider);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProvider(@RequestBody Provider updatedProvider) {
        Provider existingProvider = providerService.findById(updatedProvider.getId());
        if (existingProvider == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Provider with ID " + updatedProvider.getId() + " not found.");
        }
        Provider savedProvider = providerService.updateProvider(updatedProvider);
        return ResponseEntity.ok(savedProvider);
    }


    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProvider(@PathVariable Integer id) {
        try {
            boolean isDeleted = providerService.deleteProvider(id);
            if (isDeleted) {
                return ResponseEntity.ok("Provider with ID " + id + " has been successfully deleted.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot delete provider because it has linked transactions.");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete provider.");
        }
    }
}
