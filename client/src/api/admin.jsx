import axios from "axios";

// http://localhost:5001/api/admin/orders

export const getOrdersAdmin = async (token) => {
  return axios.get("http://localhost:5001/api/admin/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeOrderStatus = async (token, orderId, orderStatus , trackingNumber) => {
  return axios.put(
    "http://localhost:5001/api/admin/order-status",
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
  return axios.get("http://localhost:5001/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserStatus = async (token, value) => {
  return axios.post("http://localhost:5001/api/change-status", value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeUserRole = async (token, value) => {
  return axios.post("http://localhost:5001/api/change-role", value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getOrderAdminStats = async (token) => {
  return await axios.get("http://localhost:5001/api/admin/order-stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAdminLogs = async (token) => {
  return await axios.get("http://localhost:5001/api/admin/logs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTrackingNumber = async (token, orderId, trackingNumber) => {
  return await axios.put(
    `http://localhost:5001/api/order/tracking/${orderId}`,
    { trackingNumber },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};