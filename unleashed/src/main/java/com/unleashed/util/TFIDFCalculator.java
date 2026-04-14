package com.unleashed.util;

import java.util.*;

public class TFIDFCalculator {
    /**
     * Helper method to calculate Term Frequency (TF) for each term in a given document.
     * Term Frequency is the count of each term within the document.
     *
     * @param document The document (e.g., product name).
     * @return A map where keys are terms (words) and values are their frequencies in the document.
     */
    public Map<String, Integer> calculateTermFrequency(String document) {
        Map<String, Integer> termFrequency = new HashMap<>();

        // 1. Split the document into terms (words)
        //    Convert to lowercase and split by whitespace to get individual words.
        String[] terms = document.toLowerCase().split("\\s+"); // Splits by one or more whitespace characters

        // 2. Count the frequency of each term
        for (String term : terms) {
            termFrequency.put(term, termFrequency.getOrDefault(term, 0) + 1);
        }
        return termFrequency;
    }

    /**
     * Helper method to calculate Document Frequency (DF) for each term across a list of documents (corpus).
     * Document Frequency is the number of documents in which a term appears at least once.
     *
     * @param documents List of all documents in the corpus.
     * @return A map where keys are terms (words) and values are the number of documents containing that term.
     */
    public Map<String, Integer> calculateDocumentFrequency(List<String> documents) {
        Map<String, Integer> documentFrequency = new HashMap<>();
        // Iterate through each document in the corpus
        for (String document : documents) {
            // 1. Split the document into terms (words) - similar to term frequency calculation
            String[] terms = document.toLowerCase().split("\\s+");

            // 2. Use a Set to store unique terms in the current document to avoid over-counting within a single document
            Set<String> uniqueTerms = new HashSet<>(Arrays.asList(terms));

            // 3. For each unique term in the document, increment its document frequency count
            for (String term : uniqueTerms) {
                documentFrequency.put(term, documentFrequency.getOrDefault(term, 0) + 1);
            }
        }
        return documentFrequency;
    }

    /**
     * Pre-calculates the Inverse Document Frequency (IDF) for all terms in the given documents.
     * This is an optimization to avoid recalculating IDF repeatedly.
     *
     * @param documents List of all documents (product names) in the corpus.
     * @return A map where keys are terms and values are their pre-calculated IDF scores.
     */
    public Map<String, Double> calculateIDFMap(List<String> documents) {
        Map<String, Double> idfMap = new HashMap<>();
        // 1. Calculate Document Frequency (DF) for all terms in the corpus
        Map<String, Integer> documentFrequency = calculateDocumentFrequency(documents);
        int totalDocuments = documents.size();

        // 2. Calculate IDF for each term based on DF
        for (Map.Entry<String, Integer> entry : documentFrequency.entrySet()) {
            String term = entry.getKey();
            int docCount = entry.getValue();
            // IDF = log_e( (Total number of documents) / (Number of documents containing the term) )
            // Adding 1 to the denominator to prevent division by zero if a term appears in all documents
            double idf = Math.log((double) totalDocuments / (docCount + 1));
            idfMap.put(term, idf);
        }
        return idfMap;
    }
}