package com.unleashed.service;

import com.unleashed.entity.PaymentMethod;
import com.unleashed.entity.ShippingMethod;
import com.unleashed.repo.PaymentMethodRepository;
import com.unleashed.repo.ShippingMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CheckoutService {
    private final PaymentMethodRepository paymentMethodRepository;
    private final ShippingMethodRepository shippingMethodRepository;

    @Autowired
    public CheckoutService(PaymentMethodRepository paymentMethodRepository, ShippingMethodRepository shippingMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.shippingMethodRepository = shippingMethodRepository;
    }

    public List<PaymentMethod> getAllPaymentMethod() {
        return paymentMethodRepository.findAll();
    }

    public List<ShippingMethod> getAllShippingMethod() {
        return shippingMethodRepository.findAll();
    }
}
