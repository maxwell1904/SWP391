import { apiClient } from '../core/api';
import { toast } from 'react-toastify';

export const updateComment = async (commentId, username, content, authHeader) => {
    try {
        const payload = { commentContent: content };
        const response = await apiClient.put(`/api/reviews/comments/${commentId}`, payload, {
            headers: { Authorization: authHeader },
            params: { username }
        });
        toast.success("Comment updated successfully!");
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update comment.");
        throw error;
    }
};

export const deleteComment = async (commentId, username, authHeader) => {
    try {
        const payload = { username: username };
        const response = await apiClient.delete(`/api/comments/${commentId}`, {
            headers: { Authorization: authHeader },
            data: payload
        });
        toast.success("Comment deleted successfully!");
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete comment.");
        throw error;
    }
};

export const postReply = async (commentData, authHeader) => {
    try {
        const response = await apiClient.post('/api/comments', commentData, {
            headers: { Authorization: authHeader },
        });
        toast.success("Your reply has been posted!");
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to post reply.");
        throw error;
    }
};

export const getReplies = async (commentId, page = 0, size = 5) => {
    try {
        const response = await apiClient.get(`/api/reviews/comments/${commentId}/replies`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching replies for comment ${commentId}:`, error);
        throw error;
    }
};

export const getCommentAncestors = async (commentId) => {
    try {
        const response = await apiClient.get(`/api/comments/${commentId}/ancestors`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ancestors for comment ${commentId}:`, error);
        throw error;
    }
};

export const getDescendantReplies = async (commentId, page = 0, size = 10) => {
    try {
        const response = await apiClient.get(`/api/comments/${commentId}/descendants`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching descendant replies for comment ${commentId}:`, error);
        throw error;
    }
};