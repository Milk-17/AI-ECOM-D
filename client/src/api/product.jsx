import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const createProduct = async (token, productData) => {
  const res = await api.post('/product', productData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // backend บางทีไม่ส่ง product กลับ ให้ fallback เป็น productData
  return {
    data: {
      product: res.data.product || productData,
      ...res.data,
    },
  };
};
export const listProduct = async (count = 20) => {
  // code body
  return api.get("/products/" + count);
};

export const readProduct = async (token, id) => {
  // code body
  return api.get("/product/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteProduct = async (token, id) => {
  // code body
  return api.delete("/product/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateProduct = async (token, id, form) => {
  // code body
  return api.put("/product/" + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const uploadFiles = async (token, form) => {
  // code
  // console.log('form api frontent', form)
  return api.post(
    "/images",
    {
      image: form,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const removeFiles = async (token, public_id) => {
  // code
  // console.log('form api frontent', form)
  return api.post(
    "/removeimages",
    {
      public_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const searchFilters = async (arg) => {
  // code body
  return api.post("/search/filters", arg);
};

export const listProductBy = async (sort, order, limit) => {
  // code body
  return api.post("/productby", {
    sort,
    order,
    limit,
  });
};

export const getProductById = async (id) => {
  return await api.get(`/product/${id}`);
};

// ดึง Product Price History
export const getProductPriceHistory = async (token) => {
  return await api.get(`/productpricehistory`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

