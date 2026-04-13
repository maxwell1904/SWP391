package com.unleashed.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.system-user")
public record SystemUserProperties(
        String username,
        String fullname,
        String email,
        String password
) {}