import { toast, Zoom } from "react-toastify";
import { apiClient } from "../core/api";

export const getProductReviews = async (productId, page = 0, size = 5, authHeader) => {
    try {
        const response = await apiClient.get(`/api/reviews/product/${productId}`, {
            headers: authHeader ? { Authorization: authHeader } : {},
            params: {
                page,
                size,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw error;
    }
};

export const getDashboardReviews = async (page, size, authHeader, search, sort) => {
    try {
        const response = await apiClient.get('/api/reviews/get-all', {
            headers: { Authorization: authHeader },
            params: {
                page: page,
                size: size,
                search: search,
                sort: sort,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard reviews:", error);
        throw error;
    }
};

export const getDashboardProductReviews = async (productId, authHeaderString, page = 0, size = 10) => {
    try {
        const response = await apiClient.get(`/api/reviews/dashboard/product/${productId}`, {
            headers: {
                Authorization: authHeaderString
            },
            params: {
                page,
                size
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard product reviews:", error);
        toast.error("Error fetching dashboard product reviews: " + error?.response?.data?.message, {
            position: "top-center",
            transition: Zoom
        });
        throw error;
    }
};

export const getReviewEligibility = async (productId, authHeader) => {
    try {
        const response = await apiClient.get('/api/reviews/eligibility', {
            params: { productId },
            headers: { Authorization: authHeader },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching review eligibility:", error);
        throw error;
    }
};

export const postReview = async (reviewData, authHeader) => {
    try {
        const response = await apiClient.post('/api/reviews', reviewData, {
            headers: { Authorization: authHeader },
        });
        return response.data;
    } catch (error) {
        console.error("Error posting review:", error);
        toast.error(error.response?.data?.message || "Failed to submit review.", {
            position: "top-center",
            transition: Zoom
        });
        throw error.response?.data?.message || "Failed to submit review.";
    }
};