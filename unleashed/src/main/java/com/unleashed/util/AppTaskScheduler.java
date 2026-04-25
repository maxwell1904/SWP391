package com.unleashed.util;

import com.unleashed.service.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/**
 * A central scheduler to run all recurring background tasks for the application.
 * This component scans for methods annotated with @Scheduled and executes them
 * on a configured schedule.
 */
@Component
public class AppTaskScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AppTaskScheduler.class);

    private final PromotionService promotionService;
    private final VoucherService voucherService;
    private final ProductService productService;
    private final UserService userService;

    /**
     * Constructor-based dependency injection. Spring will automatically provide
     * the necessary service beans when creating this scheduler.
     *
     * @param promotionService The service responsible for promotion-related business logic.
     */
    @Autowired
    public AppTaskScheduler(PromotionService promotionService,
                            VoucherService voucherService,
                            ProductService productService,
                            UserService userService) {
        this.promotionService = promotionService;
        this.voucherService = voucherService;
        this.productService = productService;
        this.userService = userService;
    }

    @PostConstruct
    public void initializeSystemUser() {
        logger.info("Checking for 'System' user on application startup...");
        try {
            userService.findOrCreateSystemUser();
            userService.findOrCreateDefaultPrivilegedUsersForDev();
            productService.performScheduledAgingUpdate();
            promotionService.performScheduledStatusUpdates();
            voucherService.performScheduledStatusUpdates();
            productService.performScheduledStockUpdates();
            logger.info("'System' user initialized successfully.");
        } catch (Exception e) {
            logger.error("Failed to initialize 'System' user.", e);
        }
    }


    /**
     * This method runs at the beginning of every minute, aligned with the server's clock.
     * It uses a cron expression to achieve this precise timing.
     * Cron Expression Breakdown: "0 * * * * *"
     *  - 0:  At the 0th second (i.e., the start of the minute)
     *  - *:  Every minute
     *  - *:  Every hour
     *  - *:  Every day of the month
     *  - *:  Every month
     *  - *:  Every day of the week
     * By default, this uses the server's local time zone.
     */
    @Scheduled(cron = "0 * * * * *")
    public void performMinute_lyTasks() {
        logger.info("Scheduler triggered: Starting background tasks...");
        Instant start = Instant.now();
        try {
            // tasks
            promotionService.performScheduledStatusUpdates();
            voucherService.performScheduledStatusUpdates();
            productService.performScheduledStockUpdates();

        } catch (Exception e) {
            // Catching a broad exception is acceptable here to prevent the scheduler from dying
            logger.error("An unexpected error occurred during a scheduled task.", e);
        } finally {
            Instant end = Instant.now();
            long duration = Duration.between(start, end).toMillis();
            logger.info("Scheduler finished: All tasks completed in {} ms.", duration);
        }
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void performDailyTasks() {
        logger.info("Daily scheduler started: Starting background tasks...");
        try {
            productService.performScheduledAgingUpdate();
        } catch (Exception e) {
            logger.error("An unexpected error occurred during a scheduled task.", e);
        }
        logger.info("Daily scheduler finished: All tasks completed.");

    }



}