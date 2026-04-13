package com.unleashed;

import com.unleashed.config.SystemUserProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties(SystemUserProperties.class)
public class unleashedApplication {

    public static void main(String[] args) {
        SpringApplication.run(unleashedApplication.class, args);
    }
}