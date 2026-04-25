import {apiClient} from '../core/api'
import {toast, Zoom} from 'react-toastify'

export const GetUserInfo = (authHeader) => {
	try {
        return apiClient.get('/api/account/me', {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		if (error.message) {
			toast.error(error.message, {
				position: 'bottom-center',
				transition: Zoom,
			})
		}
	}
}
export const GetCustomerNotifications = async (authHeader, username) => {
	return apiClient.get(`/api/notifications/customer/${username}`, {
		headers: { Authorization: authHeader },
	})
}
export const GetActiveCustomerNotifications = async (authHeader, username) => {
	return apiClient.get(`/api/notifications/customer/${username}`, {
		headers: { Authorization: authHeader },
	})
}


export const getMyReviews = async (authHeader, username) => {
    return await apiClient.get(`/api/reviews/user/${username}`, {
        headers: {
            Authorization: authHeader,
        },
    })
}

export const UpdateUserInfo = async (data, authHeader, signIn) => {
	try {
        return await apiClient.put(
            '/api/account',
            {
                userId: data.userId,
                username: data.username,
                userImage: data.userImage,
                fullName: data.fullName,
                userAddress: data.userAddress,
                userPhone: data.userPhone,
            },
            {
                headers: {
                    Authorization: authHeader,
                },
            }
        )
	} catch (error) {
		console.error('Error in UpdateUserInfo:', error)
		throw error
	}
}

export const RequestDeleteAccount = async (authHeader, password = "") => {
	try {
        return await apiClient.post(
            '/api/account/request-delete',
            {
                password,
            },
            {
                headers: {
                    Authorization: authHeader,
                },
            }
        )
	} catch (error) {
		throw error
	}
}
export const ChangePassword = async (data, authHeader) => {
	// console.log('📩 Gửi request đổi mật khẩu với:', data)

	try {
        return await apiClient.put(
            '/api/user/update-password',
            {
                userEmail: data.userEmail,
                newPassword: data.newPassword,
                oldPassword: data.oldPassword,
            },
            {
                headers: {
                    Authorization: authHeader,
                },
            }
        )
	} catch (error) {
		console.error('❌ ChangePassword Error:', error)
	}
}

export const GetNotifications = async (authHeader) => {
	try {
        return apiClient.get('/api/notifications/as', {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		// console.log(error?.data)
	}
}

export const getMyorders = async (authHeader, page) => {
	try {
        return await apiClient.get('/api/orders/my-orders?page=' + page + '&size=6', {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		throw(error);
	}
}

export const getMyVoucher = async (authHeader) => {
	try {
        return await apiClient.get('/api/vouchers/me', {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		// console.log(error.data)
	}
}

export const fetchUserCart = async (authHeader) => {
	try {
        return await apiClient.get('/api/cart', {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		// console.log(error.data)
	}
}

export const addToCart = async (authHeader, variationId, quantity) => {
    try {
        return await apiClient.post(`/api/cart/${variationId}`, quantity, {
            headers: {
                Authorization: authHeader,
            },
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const removeFromCart = async (authHeader, variationId) => {
	try {
        return await apiClient.delete(`/api/cart/${variationId}`, {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		// console.log(error.data)
	}
}
export const removeAllFromCart = async (authHeader) => {
	try {
        return await apiClient.delete(`/api/cart/All`, {
            headers: {
                Authorization: authHeader,
            },
        })
	} catch (error) {
		// console.log(error.data)
	}
}

export const getLatestNotifications = async (authHeader, username) => {
    try {
        const response = await apiClient.get('/api/notifications/customer/latest', {
            headers: { Authorization: authHeader },
            params: { username },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching latest notifications:", error);
        throw error;
    }
};

export const getAllNotifications = async (authHeader, username, page = 0, size = 10) => {
    try {
        const response = await apiClient.get('/api/notifications/customer/all', {
            headers: { Authorization: authHeader },
            params: { username, page, size },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        throw error;
    }
};

export const markNotificationAsViewed = async (notificationId, authHeader, username) => {
    try {
        await apiClient.put(`/api/notifications/customer/view/${notificationId}`, null, {
            headers: { Authorization: authHeader },
            params: { username },
        });
    } catch (error) {
        console.error("Error marking notification as viewed:", error);
        throw error;
    }
};


export const deleteNotificationForCustomer = async (notificationId, authHeader, username) => {
    try {
        await apiClient.put(`/api/notifications/customer/delete/${notificationId}`, null, {
            headers: { Authorization: authHeader },
            params: { username },
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};
