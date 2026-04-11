import { toast, Zoom } from "react-toastify";
import { apiClient } from "../core/api";


export const getCategory = async () => {
    try {
        const response = await apiClient.get("/api/categories");
        return response.data;
    } catch (error) {
        toast.error(
            error.message ||
            "Unable to load the category list. Please try again later.",
            {
                position: "top-left",
                transition: Zoom,
            }
        );
        return [];
    }
};

export const getBrand = async () => {
    try {
        const response = await apiClient.get("/api/brands");
        return response.data;
    } catch (error) {
        toast.error(
            error.message ||
            "Unable to load the brand list. Please try again later.",
            {
                position: "top-left",
                transition: Zoom,
            }
        );
        return [];
    }
};

export const getProductList = async (page, size, filters, inStockOnly = false) => {
    try {
        const params = new URLSearchParams({
            page: page - 1,
            size: size
        });


        if (filters.category) params.append('category', filters.category);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.priceOrder) params.append('priceOrder', filters.priceOrder);
        if (filters.rating > 0) params.append('rating', filters.rating);
        if (filters.query) {
            params.append('query', filters.query);
        }

        if (inStockOnly) {
            params.append('inStockOnly', 'true');
        }

        const response = await apiClient.get("/api/products", { params });
        return response.data;

    } catch (error) {
        toast.error(
            error.message ||
            "Unable to load the product list. Please try again later.",
            {
                position: "top-left",
                transition: Zoom,
            }
        );
        return { content: [], totalPages: 0, totalElements: 0 };
    }
};

export const getProductItem = async (productId) => {
    try {
        const response = await apiClient.get("/api/products/" + productId.id);
        return response.data;
    } catch (error) {
        toast.error(
            error.message ||
            "Unable to load this product! Please try again.",
            {
                position: "top-left",
                transition: Zoom,
            }
        );
        return [];
    }
};


export const getProductRecommendations = async (productId, username) => {
    try {
        const response = await apiClient.get("/api/recommendations", {
            params: {
                username: username,
                productId: productId
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching product recommendations:', error);
        return [];
    }
};