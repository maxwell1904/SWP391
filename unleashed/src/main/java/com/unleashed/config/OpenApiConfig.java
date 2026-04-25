package com.unleashed.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openAPI(@Value("${open.api.title}") String title,
                           @Value("${open.api.version}") String version,
                           @Value("${open.api.description}") String description,
                           @Value("${open.api.serverUrl}") String serverUrl) {
        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description))
                .servers(List.of(new Server().url(serverUrl)));
    }

    // from this point onward, is pain beyond human comprehension
    // they can't be used so uhh, config however you like


//    @Bean
//    public GroupedOpenApi adminApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Admin")
//                .packagesToScan("com.unleashed.controller") // Scanning the base controller package and then filter by controller names
//                .pathsToMatch("/admin/**", "/frontend/**") // Assuming AdminController and FrontEndController paths start with /admin and /frontend respectively. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi accountAuthApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Account & Auth")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/account/**", "/auth/**") // Assuming AccountRestController and AuthRestController paths start with /account and /auth respectively. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi brandApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Brand")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/brands/**") // Assuming BrandRestController paths start with /brands. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi categoryApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Category")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/categories/**") // Assuming CategoryRestController paths start with /categories. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi colorApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Color")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/colors/**") // Assuming ColorRestController paths start with /colors. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi voucherApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Voucher")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/vouchers/**") // Assuming VoucherRestController paths start with /vouchers. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi messengerApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Messenger")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/messenger/**") // Assuming MessengerRestController paths start with /messenger. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi notificationApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Notification")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/notifications/**") // Assuming NotificationRestController paths start with /notifications. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi orderApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Order")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/orders/**") // Assuming OrderRestController paths start with /orders. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi payOsApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("PayOs")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/payos/**") // Assuming PayOsRestController paths start with /payos. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi productApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Product")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/products/**", "/product-variations/**") // Assuming ProductRestController and ProductVariationRestController paths start with /products and /product-variations. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi reviewApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Review")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/reviews/**") // Assuming ReviewRestController paths start with /reviews. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi promotionApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Promotion")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/promotions/**") // Assuming PromotionRestController paths start with /promotions. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi sizeApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Size")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/sizes/**") // Assuming SizeRestController paths start with /sizes. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi statisticsApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Statistics")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/statistics/**") // Assuming StatisticsRestController paths start with /statistics. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi stockApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("Stock")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/stocks/**", "/stock-transactions/**") // Assuming StockRestController and StockTransactionRestController paths start with /stocks and /stock-transactions. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi userApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("User")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/users/**") // Assuming UserRestController paths start with /users. Adjust paths if needed
//                .build();
//    }
//
//    @Bean
//    public GroupedOpenApi vnPayApiGroup() {
//        return GroupedOpenApi.builder()
//                .group("VNPay")
//                .packagesToScan("com.unleashed.controller")
//                .pathsToMatch("/vnpay/**") // Assuming VNPayRestController paths start with /vnpay. Adjust paths if needed
//                .build();
//    }

}
