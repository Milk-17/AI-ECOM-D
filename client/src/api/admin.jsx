import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getOrdersAdmin = async (token) => {
  return api.get("/admin/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeOrderStatus = async (token, orderId, orderStatus , trackingNumber) => {
  return api.put(
    "/admin/order-status",
    {
      orderId,
      orderStatus,
      trackingNumber,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getListAllUsers = async (token) => {
  return api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserStatus = async (token, value) => {
  return api.post("/change-status", value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserRole = async (token, value) => {
  return api.post("/change-role", value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getOrderAdminStats = async (token) => {
  return await api.get("/admin/order-stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAdminLogs = async (token) => {
  return await api.get("/admin/logs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTrackingNumber = async (token, orderId, trackingNumber) => {
  return await api.put(
    `/order/tracking/${orderId}`,
    { trackingNumber },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};