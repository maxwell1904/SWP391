package com.unleashed.repo;

import com.unleashed.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Integer> {
    boolean existsByProviderPhone(String providerPhone);

    boolean existsByProviderEmail(String providerEmail);
}