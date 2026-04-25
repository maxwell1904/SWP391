package com.unleashed.config;

public class RecommendationConfig {

    // --- Score Weights ---
    // These weights determine the importance of each factor in the recommendation score calculation.
    public static final double SCORE_WEIGHT_SIZE = 3.4;                 // Weight for matching product size
    public static final double SCORE_WEIGHT_BRAND = 1.6;                // Weight for matching product brand
    public static final double SCORE_WEIGHT_CATEGORY = 0.3;             // Weight for matching product category
    public static final double SCORE_WEIGHT_PRICE = 1.3;                // Weight for product price within user's preferred range
    public static final double SCORE_WEIGHT_COLOR = 0.9;                // Weight for matching product color
    public static final double SCORE_WEIGHT_PROMOTION = 1.9;            // Weight for products currently on promotion
    public static final double SCORE_WEIGHT_VOUCHER = 1.1;             // Weight for products with available vouchers
    public static final double SCORE_WEIGHT_CART_FREQUENCY = 0.5;       // Weight for products frequently added to cart
    public static final double SCORE_WEIGHT_CART_QUANTITY = 0.4;        // Weight for products added to cart in high quantities
    public static final double SCORE_WEIGHT_TRENDING = 2.2;             // Weight for trending products
    public static final double SCORE_WEIGHT_NAME_RELATIVE = 9;          // Weight for products that has name close to the current one
    public static final double SCORE_WEIGHT_NAME_EXACT_MATCH = 12;      // Weight for products that has name exactly like the current one
    public static final double SCORE_WEIGHT_NAME_DISSIMILAR = 1.5;       // Penalty deduction if names are completely dissimilar

    // --- Voucher Threshold ---
    // Configuration for applying a bonus to products based on the number of usable vouchers.
    public static final int VOUCHER_BONUS_THRESHOLD = 3;               // Minimum number of usable vouchers to trigger a bonus
    public static final double USABLE_VOUCHER_BONUS_PERCENTAGE = 0.08; // Bonus percentage per usable voucher OVER the threshold


    // --- Price Range ---
    // Determines how much the user's average purchase price can be expanded for recommendations.
    public static final double PRICE_RANGE_EXPANSION_FACTOR = 0.3;      // Factor to expand the price range (e.g., 0.3 means +/- 30%)


    // --- Order History ---
    // Settings related to the user's order history used for recommendations.
    public static final int MAX_RECENT_ORDERS_TO_CONSIDER = 20;         // Maximum number of recent orders to consider


    // --- Trending Products ---
    // Configuration for identifying and recommending trending products.
    public static final int TRENDING_DAYS_WINDOW = 20;                  // Time window (in days) to determine trending products
    public static final int MAX_TRENDING_PRODUCTS = 10;                 // Maximum number of trending products to consider


    // --- Product Status Scores ---
    // Scores assigned to products based on their status (e.g., available, new, running out).
    public static final double PRODUCT_STATUS_SCORE_IMPORTING = 0.8;    // Score for products being imported
    public static final double PRODUCT_STATUS_SCORE_AVAILABLE = 2.4;    // Score for available products
    public static final double PRODUCT_STATUS_SCORE_RUNNING_OUT = 2.9;  // Score for products running out of stock
    public static final double PRODUCT_STATUS_SCORE_NEW = 3.2;          // Score for new products
    public static final double PRODUCT_STATUS_SCORE_OTHER = 0;          // Default score for other product statuses


    // --- Recommendation Score Threshold ---
    // Minimum score a product must have to be considered for recommendation.
    public static final double MINIMUM_RECOMMENDATION_SCORE = 0.1;      // Minimum score for a product to be recommended, ANY LOWER WILL NOT BE RECOMMENDED


    // --- Add more products to Final Result ---
    // Controls whether to include non-related products in the final recommendation list.
    public static final boolean RESULT_SHOULD_HAVE_NON_RELATED = false; // Whether to add non-related products
    public static final int MAX_RESULT_NON_RELATED_PRODUCTS = 10;       // Maximum number of non-related products to add


    // --- Final Result Control ---

    // RESULT_SHOULD_SORT means that the list of recommendations should sort, NOT the final output
    // Sort occurs near the end, before the finalization of the internal recommendation list
    public static final boolean RESULT_SHOULD_SORT = true;              // Whether to sort the recommendation list by score

    // RESULT_SHOULD_SHUFFLE means that the list of recommendations should shuffle, NOT the final output
    // Shuffle occurs at the end, before the output
    public static final boolean RESULT_SHOULD_SHUFFLE = true;           // Whether to shuffle the recommendation list

    // MAX_RECOMMENDATIONS means that how much should be in the recommendation LIST
    // This DOES NOT represent the final output
    public static final int MAX_RECOMMENDATIONS = 40;                   // Maximum number of products in the internal recommendation list

    // MAX_RECOMMENDATIONS_OUTPUT means that how much should be in the recommendation PAGE
    // This IS the final output
    public static final int MAX_RECOMMENDATIONS_OUTPUT = 20;            // Maximum number of products in the final output


    // Prevent instantiation
    private RecommendationConfig() {
        throw new AssertionError("Cannot instantiate RecommendationConfig");
    }
}
