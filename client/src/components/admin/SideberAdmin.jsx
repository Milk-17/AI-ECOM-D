import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useEcomStore from "../../store/ecom-store";
import {
  LayoutDashboard,
  UserCog,
  SquareChartGantt,
  ShoppingBasket,
  ListOrdered,
  LogOut,
  History,
} from "lucide-react";

const SidebarAdmin = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const logout = useEcomStore((state) => state.logout);

  const handleLogout = () => {
      logout();
      navigate("/");
  }

  const handleNavClick = () => {
    // ปิด sidebar บน mobile เมื่อคลิกเมนู
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  }

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 w-72 text-gray-100 flex flex-col h-screen transition-all duration-300 shadow-2xl border-r border-slate-700 fixed lg:relative z-40 
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      {/* Logo Header */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3 shadow-lg">
        <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg backdrop-blur">
          <LayoutDashboard size={24} className="text-white sm:w-7 sm:h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Admin</h1>
          <p className="text-blue-100 text-xs">Control Panel</p>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 sm:mb-4">Menu</div>
        <NavLink
          to="/admin"
          end
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <LayoutDashboard className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Dashboard</span>
        </NavLink>

        <NavLink
          to="AdminDashboard"
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <UserCog className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Analytics</span>
        </NavLink>

        <NavLink
          to="manage"
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <UserCog className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Manage Users</span>
        </NavLink>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mt-4 sm:mt-6 mb-2 sm:mb-3">Content</div>

        <NavLink
          to="product"
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <ShoppingBasket className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Products</span>
        </NavLink>

        <NavLink
          to="category"
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <SquareChartGantt className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Categories</span>
        </NavLink>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mt-4 sm:mt-6 mb-2 sm:mb-3">Operations</div>

        <NavLink
          to="orders"
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <ListOrdered className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Orders</span>
        </NavLink>

        <NavLink
          to="productpricehistory"
          onClick={handleNavClick}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <History className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
          <span className="font-medium text-sm sm:text-base">Price History</span>
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="p-3 sm:p-4 bg-slate-800 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full text-red-300 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 font-medium border border-red-500/30 hover:border-red-500 text-sm sm:text-base"
        >
          <LogOut className="mr-2" size={18} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default SidebarAdmin;