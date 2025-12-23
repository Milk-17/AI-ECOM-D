import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
import useEcomStore from "../../store/ecom-store"; // เพิ่ม import Store
import {
  LayoutDashboard,
  UserCog,
  SquareChartGantt,
  ShoppingBasket,
  ListOrdered,
  LogOut,
  History, // เพิ่ม icon History ให้ Price History
} from "lucide-react";

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const logout = useEcomStore((state) => state.logout); // ดึงฟังก์ชัน logout

  // ฟังก์ชันจัดการ Logout
  const handleLogout = () => {
      logout(); // ล้างค่าใน Store
      navigate("/"); // กลับหน้าหลัก
  }

  return (
    <div className="bg-gray-800 w-64 text-gray-100 flex flex-col h-screen transition-all duration-300">
      
      {/* Header */}
      <div className="h-24 bg-gray-900 flex items-center justify-center text-2xl font-bold shadow-md">
        Admin Panel
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <NavLink
          to={"/admin"}
          end
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <LayoutDashboard className="mr-3" size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to={"AdminDashboard"}
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <UserCog className="mr-3" size={20} />
          Admin Dashboard
        </NavLink>

        <NavLink
          to={"manage"}
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <UserCog className="mr-3" size={20} />
          Manage Users
        </NavLink>

        <NavLink
          to={"category"}
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <SquareChartGantt className="mr-3" size={20} />
          Categories
        </NavLink>

        <NavLink
          to={"product"}
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <ShoppingBasket className="mr-3" size={20} />
          Products
        </NavLink>

        <NavLink
          to={"orders"}
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <ListOrdered className="mr-3" size={20} />
          Orders
        </NavLink>

        <NavLink
          to={"productpricehistory"}
          className={({ isActive }) =>
            isActive
              ? "bg-gray-900 text-white px-4 py-3 rounded-md flex items-center shadow-sm transition-colors"
              : "text-gray-300 px-4 py-3 hover:bg-gray-700 hover:text-white rounded-md flex items-center transition-colors"
          }
        >
          <History className="mr-3" size={20} /> {/* เปลี่ยน icon เป็น History */}
          Price History
        </NavLink>
      </nav>

      {/* Logout Button (อยู่ด้านล่างสุด) */}
      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <button
          onClick={handleLogout} // เรียกฟังก์ชัน Logout
          className="w-full text-gray-300 px-4 py-3 hover:bg-red-600 hover:text-white rounded-md flex items-center transition-colors duration-200"
        >
          <LogOut className="mr-3" size={20} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default SidebarAdmin;