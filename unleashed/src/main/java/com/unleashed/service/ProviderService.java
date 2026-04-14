package com.unleashed.service;

import com.unleashed.entity.Provider;
import com.unleashed.repo.ProviderRepository;
import com.unleashed.repo.TransactionRepository;
import com.unleashed.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProviderService {
    private final ProviderRepository providerRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public ProviderService(ProviderRepository providerRepository, TransactionRepository transactionRepository, UserRepository userRepository) {
        this.providerRepository = providerRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public Provider findById(Integer id) {
        return providerRepository.findById(id).orElse(null);
    }

    @Transactional
    public Provider createProvider(Provider provider) {
        if (provider.getProviderName() == null || provider.getProviderName().trim().isEmpty()) {
            throw new RuntimeException("Provider name cannot be empty");
        }
        if (provider.getProviderImageUrl() == null || provider.getProviderImageUrl().trim().isEmpty()) {
            throw new RuntimeException("Provider image URL cannot be empty");
        }
        if (provider.getProviderEmail() == null || provider.getProviderEmail().trim().isEmpty()) {
            throw new RuntimeException("Provider email cannot be empty");
        }
        if (provider.getProviderPhone() == null || provider.getProviderPhone().trim().isEmpty()) {
            throw new RuntimeException("Provider phone cannot be empty");
        }
        if (provider.getProviderAddress() == null || provider.getProviderAddress().trim().isEmpty()) {
            throw new RuntimeException("Provider address cannot be empty");
        }
        if (providerRepository.existsByProviderEmail(provider.getProviderEmail()) ||
                userRepository.existsByUserEmail(provider.getProviderEmail())) {
            throw new RuntimeException("Email already exists!");
        }
        if (providerRepository.existsByProviderPhone(provider.getProviderPhone()) ||
                userRepository.existsByUserPhone(provider.getProviderPhone())) {
            throw new RuntimeException("Phone number already exists!");
        }

        return providerRepository.save(provider);
    }


    @Transactional
    public Provider updateProvider(Provider updatedProvider) {
        if (updatedProvider == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Updated provider cannot be null");
        }
        return providerRepository.findById(updatedProvider.getId())
                .map(existingProvider -> {
                    if (updatedProvider.getProviderName() == null || updatedProvider.getProviderName().trim().isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider name cannot be empty");
                    }
                    if (updatedProvider.getProviderImageUrl() == null || updatedProvider.getProviderImageUrl().trim().isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider image URL cannot be empty");
                    }
                    if (updatedProvider.getProviderEmail() == null || updatedProvider.getProviderEmail().trim().isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider email cannot be empty");
                    }
                    if (updatedProvider.getProviderPhone() == null || updatedProvider.getProviderPhone().trim().isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider phone cannot be empty");
                    }
                    if (updatedProvider.getProviderAddress() == null || updatedProvider.getProviderAddress().trim().isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider address cannot be empty");
                    }
                    if (!existingProvider.getProviderEmail().equals(updatedProvider.getProviderEmail()) &&
                            (providerRepository.existsByProviderEmail(updatedProvider.getProviderEmail()) ||
                                    userRepository.existsByUserEmail(updatedProvider.getProviderEmail()))) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists!");
                    }
                    if (!existingProvider.getProviderPhone().equals(updatedProvider.getProviderPhone()) &&
                            (providerRepository.existsByProviderPhone(updatedProvider.getProviderPhone()) ||
                                    userRepository.existsByUserPhone(updatedProvider.getProviderPhone()))) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number already exists!");
                    }
                    existingProvider.setProviderName(updatedProvider.getProviderName());
                    existingProvider.setProviderImageUrl(updatedProvider.getProviderImageUrl());
                    existingProvider.setProviderEmail(updatedProvider.getProviderEmail());
                    existingProvider.setProviderPhone(updatedProvider.getProviderPhone());
                    existingProvider.setProviderAddress(updatedProvider.getProviderAddress());
                    existingProvider.setProviderUpdatedAt(java.time.OffsetDateTime.now());
                    return providerRepository.save(existingProvider);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider not found with id: " + updatedProvider.getId()));
    }


    @Transactional
    public boolean deleteProvider(Integer id) {
        return providerRepository.findById(id).map(provider -> {
            if (transactionRepository.existsByProvider(provider)) {
                throw new RuntimeException("Cannot delete provider because it has linked transactions.");
            }
            providerRepository.delete(provider);
            return true;
        }).orElseThrow(() -> new RuntimeException("Provider with ID " + id + " not found."));
    }

}
