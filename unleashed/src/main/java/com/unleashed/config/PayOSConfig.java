package com.unleashed.config; // Or any appropriate package for configurations

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
public class PayOSConfig {

    @Bean
    public PayOS payOS() {
        String clientId = "7ed6d581-5009-4575-bc4c-0fb67295009b";
        String apiKey = "ad215859-9e79-454d-9f5c-295576031ca3";
        String checksumKey = "5666b4f514d7204e40ead619ec0f589781a1fc22ec8f7eafed3f02cc576500b5";
        return new PayOS(clientId, apiKey, checksumKey);
    }
}