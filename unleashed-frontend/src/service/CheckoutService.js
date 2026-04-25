import {apiClient} from "../core/api";
import {toast, Zoom} from "react-toastify";

export const checkVoucher = async (voucherCode, authHeader, totalOrder) => {
  try {
    const response = await apiClient.get(
      "/api/vouchers/check-user-voucher?voucher=" + voucherCode + "&total=" + totalOrder,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    return response;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Error when checking voucher code! Try again.",
      {
        position: "top-center",
        transition: Zoom,
          autoClose: 2000
      }
    );
  }
};

export const checkoutOrder = async (checkoutItem, authHeader) => {
  try {
    const response = await apiClient.post("/api/orders", {
      notes: checkoutItem.notes,
      voucherCode: checkoutItem.voucherCode,
      billingAddress: checkoutItem.billingAddress,
      shippingMethod: checkoutItem.shippingMethod,
      totalAmount: checkoutItem.totalAmount,
      paymentMethod: checkoutItem.paymentMethod,
      userAddress: checkoutItem.userAddress,
      orderDetails: checkoutItem.orderDetails
    }, {
      headers: {
        Authorization: authHeader,
      },
    })
    return response;
  } catch (error) {
    toast.error(error?.data || "Error when ordering", {
      position: "top-center",
      transition: Zoom,
        autoClose: 2000
    })
  }
};

export const paymentCallback = async (orderId, authHeader, status) => {
  try {
    const response = await apiClient.post(`/api/orders/${orderId}/payment-callback?isSuccess=${status}`, {}, {
      headers: {
        Authorization: authHeader
      }
    });
    return response;
  } catch (error) {
    console.error(error);
    // toast.error(error?.response?.data || "Error when payment", {
    //   position: "top-center",
    //   transition: Zoom
    // });
  }
};


export const cancelOrder = async (orderId, authHeader) => {
  try {
    const response = await apiClient.put("/api/orders/" + orderId + "/cancel", {}, {
      headers: {
        Authorization: authHeader
      }
    })
    return response
  } catch (error) {
    toast.error(error?.data || "Error when cancel order", {
      position: "top-center",
      transition: Zoom,
        autoClose: 2000
    })
  } 
};

export const getPaymentMethod = async (authHeader) => {
  try {
    const response = await apiClient.get("api/checkout/payment-methods", {
      headers: {
        Authorization: authHeader
      }
    })
    return response;
  } catch (error) {
    toast.error(error?.data || "Error fetching method", {
      position: "top-center",
      transition: Zoom,
        autoClose: 2000
    })
  }
};

export const getShippingMethod = async (authHeader) => {
  try {
    const response = await apiClient.get("api/checkout/shipping-methods", {
      headers: {
        Authorization: authHeader
      }
    })
    return response;
  } catch (error) {
    toast.error(error?.data || "Error fetching method", {
      position: "top-center",
      transition: Zoom,
        autoClose: 2000
    })
  }
}

export const checkStock = async (checkoutItem, authHeader) => {
    try {
        return await apiClient.post("/api/orders/check-stock", {
            orderDetails: checkoutItem.orderDetails
        }, {
            headers: {
                Authorization: authHeader,
            },
        });
    } catch (error) {
        toast.error(error.response?.data?.message || "An item in your cart is out of stock.", {
            position: "top-center",
            transition: Zoom,
            autoClose: 2000
        });
        throw error;
    }
};

export const getBestVouchers = async (authHeader, cartTotal) => {
    return apiClient.get("/api/vouchers/best-for-checkout", {
        headers: { Authorization: authHeader },
        params: { total: cartTotal }
    });
};