import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Cart from "../pages/Cart";
import History from "../pages/user/History";
import Checkout from "../pages/Checkout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Layout from "../layouts/Layout";
import LayoutAdmin from "../layouts/LayoutAdmin";
import Dashboard from "../pages/admin/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Category from "../pages/admin/Category";
import Product from "../pages/admin/Product";
import Manage from "../pages/admin/Manage";
import LayoutUser from "../layouts/LayoutUser";
import HomeUser from "../pages/user/HomeUser";
import ProtectRouteUser from "./ProtectRouteUser"; 
import ProtectRouteAdmin from "./ProtectRouteAdmin"; 
import EditProduct from "../pages/admin/EditProduct";
import Payment from "../pages/user/Payment";
import ManageOrders from '../pages/admin/ManageOrders'
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ProductDetail from "../pages/ProductDetail"; 
import FormProductPriceHistory from "../pages/admin/ProductPriceHistory";
import UserProfile from "../pages/user/UserProfile";


const router = createBrowserRouter([
  // ------------------------------------------
  // 1. Public Routes (เข้าได้ทุกคน / Layout หลัก)
  // ------------------------------------------
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "cart", element: <Cart /> },
      { path: "product/:id", element: <ProductDetail /> },
      
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> }, 
      { path: "reset-password/:token", element: <ResetPassword /> },
      
      // ***  Protected Routes ใน Layout หลัก ***
      // หน้าเหล่านี้ต้อง Login ก่อน แต่ยังใช้ Navbar/Footer ของเว็บหลัก
      { 
        path: "checkout", 
        element: <ProtectRouteUser element={<Checkout />} /> 
      },
    
    ],
  },

  // ------------------------------------------
  // 2. Admin Routes (เฉพาะ Admin เท่านั้น)
  // ------------------------------------------
  {
    path: "/admin",
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "category", element: <Category /> },
      { path: "product", element: <Product /> },
      { path: "product/:id", element: <EditProduct /> },
      { path: "manage", element: <Manage /> },
      { path: "orders", element: <ManageOrders /> },
      { path: "productpricehistory", element: <FormProductPriceHistory /> },
      {path: "AdminDashboard", element: <AdminDashboard /> },

    ],
  },

  // ------------------------------------------
  // 3. User Routes (เฉพาะ User ที่ Login แล้ว / มี Sidebar สมาชิก)
  // ------------------------------------------
  {
    path: "/user",
    element: <ProtectRouteUser element={<LayoutUser />} />,
    children: [
      { index: true, element: <HomeUser /> },
      { path: "payment", element: <Payment /> },
      { path: "history", element: <History /> },
      // หมายเหตุ: ถ้าคุณอยากให้ Profile มี Sidebar แบบหน้า History 
      // คุณสามารถย้าย { path: "profile", ... } มาใส่ในกลุ่มนี้แทนได้ครับ
      { path: "profile", element: <UserProfile /> },
    ],
  },
]);

export const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default AppRoutes;