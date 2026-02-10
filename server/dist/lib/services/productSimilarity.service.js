"use strict";
/**
 * Service for detecting similar/ambiguous products
 * Uses string similarity algorithms to find products that match user input
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSimilarityService = void 0;
class ProductSimilarityService {
    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;
        // Initialize matrix
        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }
        // Fill matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        return matrix[len1][len2];
    }
    /**
     * Calculate similarity score (0-1) between two strings
     */
    calculateSimilarity(str1, str2) {
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0)
            return 1.0;
        const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
        return 1 - distance / maxLen;
    }
    /**
     * Check if user input is a partial match (substring)
     */
    isPartialMatch(userInput, productName) {
        const userLower = userInput.toLowerCase().trim();
        const productLower = productName.toLowerCase();
        // Check if product name contains user input
        if (productLower.includes(userLower)) {
            return true;
        }
        // Check if user input contains significant part of product name
        const words = productLower.split(/\s+/);
        return words.some((word) => word.includes(userLower) || userLower.includes(word));
    }
    /**
     * Find similar products based on user input
     * Returns products with similarity > threshold
     */
    findSimilarProducts(userInput, availableProducts, threshold = 0.3 // Lower threshold to catch more matches
    ) {
        if (!userInput || userInput.trim().length === 0) {
            return [];
        }
        const userInputLower = userInput.toLowerCase().trim();
        const results = [];
        for (const product of availableProducts) {
            const productNameLower = product.name.toLowerCase();
            // Calculate similarity
            const similarity = this.calculateSimilarity(userInputLower, productNameLower);
            // Check for partial match (boost similarity)
            const isPartial = this.isPartialMatch(userInputLower, product.name);
            const finalSimilarity = isPartial ? Math.max(similarity, 0.5) : similarity;
            if (finalSimilarity >= threshold) {
                results.push({
                    name: product.name,
                    price: product.price,
                    similarity: finalSimilarity,
                });
            }
        }
        // Sort by similarity (highest first)
        results.sort((a, b) => b.similarity - a.similarity);
        return results;
    }
    /**
     * Check if user input is ambiguous (matches multiple products)
     */
    isAmbiguous(userInput, availableProducts, minMatches = 2) {
        const matches = this.findSimilarProducts(userInput, availableProducts, 0.3);
        return matches.length >= minMatches;
    }
    /**
     * Generate clarification question for ambiguous products
     */
    generateClarificationQuestion(userMention, similarProducts) {
        if (similarProducts.length === 0) {
            return "";
        }
        const options = similarProducts
            .slice(0, 5) // Limit to top 5 matches
            .map((p, i) => `${i + 1}. ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`)
            .join("\n");
        return `Saya melihat Anda menyebutkan "${userMention}". Apakah yang Anda maksud salah satu dari ini?

${options}

Silakan pilih nomor atau sebutkan nama lengkapnya.`;
    }
}
exports.ProductSimilarityService = ProductSimilarityService;
