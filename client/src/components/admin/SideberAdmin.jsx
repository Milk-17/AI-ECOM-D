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

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const logout = useEcomStore((state) => state.logout);

  const handleLogout = () => {
      logout();
      navigate("/");
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 w-72 text-gray-100 flex flex-col h-screen transition-all duration-300 shadow-2xl border-r border-slate-700">
      
      {/* Logo Header */}
      <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3 shadow-lg">
        <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur">
          <LayoutDashboard size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="text-blue-100 text-xs">Control Panel</p>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-4">Menu</div>
        <NavLink
          to={"/admin"}
          end
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <LayoutDashboard className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to={"AdminDashboard"}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <UserCog className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Analytics</span>
        </NavLink>

        <NavLink
          to={"manage"}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <UserCog className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Manage Users</span>
        </NavLink>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-3">Content</div>

        <NavLink
          to={"product"}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <ShoppingBasket className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Products</span>
        </NavLink>

        <NavLink
          to={"category"}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <SquareChartGantt className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Categories</span>
        </NavLink>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-3">Operations</div>

        <NavLink
          to={"orders"}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <ListOrdered className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Orders</span>
        </NavLink>

        <NavLink
          to={"productpricehistory"}
          className={({ isActive }) =>
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center shadow-lg transition-all transform"
              : "text-gray-300 px-4 py-3 hover:bg-slate-700 hover:text-white rounded-lg flex items-center transition-all duration-200"
          }
        >
          <History className="mr-3 flex-shrink-0" size={20} />
          <span className="font-medium">Price History</span>
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full text-red-300 px-4 py-3 hover:bg-red-600 hover:text-white rounded-lg flex items-center transition-all duration-200 font-medium border border-red-500/30 hover:border-red-500"
        >
          <LogOut className="mr-3" size={20} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default SidebarAdmin;