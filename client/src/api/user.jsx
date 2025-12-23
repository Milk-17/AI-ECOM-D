import axios from 'axios';

// Cart APIs
export const createUserCart = async (token , cart) => {
    return await axios.post('http://localhost:5001/api/user/cart',cart,{
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const listUserCart = async (token) => {
    return await axios.get('http://localhost:5001/api/user/cart',{
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ================= ADDRESS APIs (New) =================

// สร้างที่อยู่ใหม่
export const saveAddress = async (token, address) => {
    return await axios.post('http://localhost:5001/api/user/address', address, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ดึงรายการที่อยู่ทั้งหมด
export const getAddress = async (token) => {
    return await axios.get('http://localhost:5001/api/user/address', {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ลบที่อยู่
export const deleteAddress = async (token, addressId) => {
  return await axios.delete(`http://localhost:5001/api/user/address/${addressId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateAddress = async (token, addressId, form) => {
  return await axios.put(
    "http://localhost:5001/api/user/address", 
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
    return await axios.post('http://localhost:5001/api/user/order',payload,{
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getOrders = async (token) => {
    return axios.get("http://localhost:5001/api/user/order", {
      headers: { Authorization: `Bearer ${token}` },
    });
};

//  อัปเดตโปรไฟล์
export const updateUserProfile = async (token, value) => {
    return await axios.put(
      "http://localhost:5001/api/user/update-profile", // เช็ค Port ให้ตรงกับ Server คุณ
      value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  export const changePassword = async (token, form) => {
    return await axios.put(
      "http://localhost:5001/api/user/change-password", 
      form, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

