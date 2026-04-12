import {apiClient} from "../core/api";

export const getOrderById = async (orderId, authHeader) => {
  try {
    const response = await apiClient.get("/api/orders/me/" + orderId, {
      headers: {
        Authorization: authHeader,
      },
    });
    return response;
  } catch (error) {
   // console.log("Error fetching Order");
  }
};

export const confirmOrder = async (orderId, authHeader) => {
  try {
    return await apiClient.put(
        "/api/orders/" + orderId + "/confirm-receipt",
        {}, {
          headers: {
            Authorization: authHeader
          }
        }
    );
  } catch (error) {
  }
};

export const returnOrder = async (orderId, authHeader) => {
  try {
    return await apiClient.put(
        "/api/orders/" + orderId + "/return",
        {}, {
          headers: {
            Authorization: authHeader
          }
        }
    );
  } catch (error) {
  }
};

export const inspectOrder = async (orderId, authHeader) => {
    try {
        return await apiClient.put(
            "/api/orders/" + orderId + "/inspect",
            {}, {
                headers: {
                    Authorization: authHeader
                }
            }
        );
    } catch (error) {
    }
};

export const orderReturned = async (orderId, authHeader) => {
    try {
        return await apiClient.put(
            "/api/orders/" + orderId + "/returned",
            {}, {
                headers: {
                    Authorization: authHeader
                }
            }
        );
    } catch (error) {
    }
};


