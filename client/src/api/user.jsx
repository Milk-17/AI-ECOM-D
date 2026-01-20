import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Cart APIs
export const createUserCart = async (token , cart) => {
    return await api.post('/user/cart',cart,{
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const listUserCart = async (token) => {
    return await api.get('/user/cart',{
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ================= ADDRESS APIs (New) =================

// สร้างที่อยู่ใหม่
export const saveAddress = async (token, address) => {
    return await api.post('/user/address', address, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ดึงรายการที่อยู่ทั้งหมด
export const getAddress = async (token) => {
    return await api.get('/user/address', {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ลบที่อยู่
export const deleteAddress = async (token, addressId) => {
  return await api.delete(`/user/address/${addressId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateAddress = async (token, addressId, form) => {
  return await api.put(
    "/user/address", 
    {
      addressId,
      ...form
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
};

// ================= ORDER APIs =================

export const saveOrder = async (token, payload) => {
    return await api.post('/user/order',payload,{
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getOrders = async (token) => {
    return api.get("/user/order", {
      headers: { Authorization: `Bearer ${token}` },
    });
};

//  อัปเดตโปรไฟล์
export const updateUserProfile = async (token, value) => {
    return await api.put(
      "/user/update-profile", // เช็ค Port ให้ตรงกับ Server คุณ
      value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  export const changePassword = async (token, form) => {
    return await api.put(
      "/user/change-password", 
      form, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

