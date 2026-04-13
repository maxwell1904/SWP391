package com.unleashed.rest;

import com.unleashed.entity.PaymentMethod;
import com.unleashed.entity.ShippingMethod;
import com.unleashed.service.CheckoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/checkout")
public class CheckoutRestController {

    private final CheckoutService checkoutService;

    @Autowired
    public CheckoutRestController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethod>> getPaymentMethods() {
        //System.out.println("getPaymentMethods");
        return ResponseEntity.ok(checkoutService.getAllPaymentMethod());
    }

    @GetMapping("/shipping-methods")
    public ResponseEntity<List<ShippingMethod>> getShippingMethods() {
        //System.out.println("getShippingMethods");
        return ResponseEntity.ok(checkoutService.getAllShippingMethod());
    }
}
