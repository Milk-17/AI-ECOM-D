import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listCategory } from "../api/Category";
import { listProduct, searchFilters } from "../api/product";
import _ from "lodash";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const ecomStore = (set, get) => ({
  user: null,
  token: null,
  categories: [],
  products: [],
  carts: [],
  logout: () => {
    set({
      user: null,
      token: null,
      categories: [],
      products: [],
      carts: [],
    });
  },
  actionAddtoCart: (product) => {
    const carts = get().carts;
    // 1. หาว่ามีสินค้านี้ในตะกร้าหรือยัง? (เช็คจาก ID จะแม่นยำที่สุด)
    const index = carts.findIndex((item) => item.id === product.id);

    if (index !== -1) {
      // 2. กรณี "มีของอยู่แล้ว" -> ให้บวกจำนวน (count) เพิ่ม 1
      const newCarts = [...carts]; // copy array เดิมมา
      newCarts[index].count += 1;  // บวกจำนวนเพิ่ม
      set({ carts: newCarts });    // update state
    } else {
      // 3. กรณี "ยังไม่มี" -> เพิ่มสินค้าใหม่ต่อท้าย
      set({ carts: [...carts, { ...product, count: 1 }] });
    }
  },
  actionUpdateQuantity: (productId, newQuantity) => {
    // console.log('Update Clickkkkk', productId, newQuantity)
    set((state) => ({
      carts: state.carts.map((item) =>
        item.id === productId
          ? { ...item, count: Math.max(1, newQuantity) }
          : item
      ),
    }));
  },

  actionUpdateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData } // เอาข้อมูลใหม่ (ชื่อ, รูป) ไปทับข้อมูลเก่า
    }));
  },
  
  actionRemoveProduct: (productId) => {
    // console.log('remove jaaaaa', productId)
    set((state) => ({
      carts: state.carts.filter((item) => item.id !== productId),
    }));
  },
 
  actionDeleteProduct: (productId) => {
    set((state) => ({
      // ใช้ != (เท่ากับ 2 ตัว) เผื่อ ID เป็น string/number ไม่ตรงกัน
      products: state.products.filter((item) => item.id != productId), 
    }));
  },

  getTotalPrice: () => {
    return get().carts.reduce((total, item) => {
      return total + item.price * item.count;
    }, 0);
  },
  actionLogin: async (form) => {
    const res = await api.post("/login", form);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },
  getCategory: async () => {
    try {
      const {data} = await listCategory();
      set({ categories: data });
    } catch (err) {
      console.log(err);
    }
  },
  getProduct: async (count) => {
    try {
      const res = await listProduct(count);
      set({ products: res.data });
    } catch (err) {
      console.log(err);
    }
  },
  actionSearchFilters: async (arg) => {
    try {
      const res = await searchFilters(arg);
      set({ products: res.data });
    } catch (err) {
      console.log(err);
    }
  },
  clearCart: () => set({ carts: [] }),
});

const usePersist = {
  name: "ecom-store",
  storage: createJSONStorage(() => localStorage),
};

const useEcomStore = create(persist(ecomStore, usePersist));

export default useEcomStore;