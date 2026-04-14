package com.unleashed.util;

import java.util.*;

public class StringSimilarityUtils {

    /**
     * Calculates the Cosine Similarity between two text strings based on Term Frequency (TF).
     * This method measures the similarity by comparing the angle between the TF vectors of the two texts.
     * A higher cosine similarity indicates greater similarity between the texts.
     *
     * @param text1 The first text string to compare.
     * @param text2 The second text string to compare.
     * @return The Cosine Similarity score between the two texts, ranging from 0.0 to 1.0.
     * Returns 0.0 if either input text is null, blank, or if a division by zero occurs.
     */
    public static double calculateCosineSimilarityTF(String text1, String text2) {
        // Handle cases where either text is null or blank. In such cases, no similarity can be calculated, so return 0.0.
        if (text1 == null || text2 == null || text1.isBlank() || text2.isBlank()) {
            return 0.0;
        }

        // Create an instance of TFIDFCalculator to reuse its term frequency calculation logic.
        // Although named TFIDFCalculator, it's being used here solely for calculating Term Frequency (TF).
        TFIDFCalculator tfidfCalculator = new TFIDFCalculator();

        // Calculate Term Frequency (TF) for the first text string.
        // This counts the occurrences of each word in text1.
        Map<String, Integer> tf1 = tfidfCalculator.calculateTermFrequency(text1);

        // Calculate Term Frequency (TF) for the second text string.
        // This counts the occurrences of each word in text2.
        Map<String, Integer> tf2 = tfidfCalculator.calculateTermFrequency(text2);

        // Initialize maps to store TF vectors as Double values.
        // Using Double for consistency with magnitude calculation and potential future scaling.
        Map<String, Double> tfVector1 = new HashMap<>();
        Map<String, Double> tfVector2 = new HashMap<>();

        // Convert the Integer TF values from tf1 to Double and store them in tfVector1.
        for (Map.Entry<String, Integer> entry : tf1.entrySet()) {
            tfVector1.put(entry.getKey(), (double) entry.getValue()); // Store TF as double
        }

        // Convert the Integer TF values from tf2 to Double and store them in tfVector2.
        for (Map.Entry<String, Integer> entry : tf2.entrySet()) {
            tfVector2.put(entry.getKey(), (double) entry.getValue()); // Store TF as double
        }

        // Create a Set to hold all unique terms present in both tfVector1 and tfVector2.
        // This set represents the dimensions of our vector space.
        Set<String> allTerms = new HashSet<>(tfVector1.keySet());
        allTerms.addAll(tfVector2.keySet());

        // Initialize the dot product to 0. The dot product measures the overlap between the two vectors.
        double dotProduct = 0.0;

        // Iterate through all unique terms.
        for (String term : allTerms) {
            // Calculate the contribution of the current term to the dot product.
            // Get the TF value of the term from tfVector1 (defaulting to 0.0 if the term is not present).
            // Get the TF value of the term from tfVector2 (defaulting to 0.0 if the term is not present).
            // Multiply these TF values and add to the dotProduct.
            dotProduct += tfVector1.getOrDefault(term, 0.0) * tfVector2.getOrDefault(term, 0.0);
        }

        // Calculate the magnitude (Euclidean norm) of tfVector1.
        double magnitude1 = calculateMagnitudeTF(tfVector1);

        // Calculate the magnitude (Euclidean norm) of tfVector2.
        double magnitude2 = calculateMagnitudeTF(tfVector2);

        // Check if either magnitude is zero. If so, to avoid division by zero, return 0.0 as cosine similarity.
        // This happens if one or both of the input texts have no terms after processing.
        if (magnitude1 == 0.0 || magnitude2 == 0.0) {
            return 0.0;
        } else {
            // Calculate Cosine Similarity by dividing the dot product by the product of the magnitudes.
            return dotProduct / (magnitude1 * magnitude2);
        }
    }

    /**
     * Helper method to calculate the magnitude (Euclidean norm or L2 norm) of a Term Frequency (TF) vector.
     * The magnitude is the length of the vector in the vector space.
     *
     * @param tfVector A map representing the TF vector, where keys are terms and values are their TF scores (as Doubles).
     * @return The magnitude of the TF vector.
     */
    private static double calculateMagnitudeTF(Map<String, Double> tfVector) {
        // Initialize the sum of squares to 0.
        double magnitudeSquared = 0.0;

        // Iterate through all TF values in the tfVector.
        for (double value : tfVector.values()) {
            // Square each TF value and add it to the magnitudeSquared.
            magnitudeSquared += value * value;
        }

        // Calculate the square root of the sum of squares to get the magnitude.
        return Math.sqrt(magnitudeSquared);
    }

    public static double calculateExactWordMatchBonus(String name1, String name2) {
        if (name1 == null || name2 == null || name1.isBlank() || name2.isBlank()) {
            return 0.0;
        }

        Set<String> terms1 = new HashSet<>(Arrays.asList(name1.toLowerCase().split("\\s+")));
        Set<String> terms2 = new HashSet<>(Arrays.asList(name2.toLowerCase().split("\\s+")));

        terms1.retainAll(terms2); // Keep only the common terms (intersection)

        return (double) terms1.size() / Math.max(terms1.size() + terms2.size() - terms1.size(), 1); // Jaccard-like bonus
    }

}