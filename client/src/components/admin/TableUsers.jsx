import React, { useState, useEffect } from "react";
import { getListAllUsers, changeUserStatus, changeUserRole } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  Calendar,
  Dot 
} from "lucide-react";

const TableUsers = () => {
  const token = useEcomStore((state) => state.token);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null); 

  useEffect(() => {
    if (token) {
        handleGetUsers(token);
    }
  }, [token]);

  const handleGetUsers = (token) => {
    setLoading(true);
    getListAllUsers(token)
      .then((res) => {
        setUsers(res.data || []); 
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        toast.error("ดึงข้อมูลไม่สำเร็จ (Failed to fetch users)");
        setUsers([]); 
      })
      .finally(() => setLoading(false));
  };

  const handleChangeUserStatus = (userId, userStatus) => {
    setUpdatingId(userId);
    const value = {
      id: userId,
      enable: !userStatus, 
    };
    changeUserStatus(token, value)
      .then((res) => {
        handleGetUsers(token);
        const message = !userStatus ? "เปิดใช้งาน (Enabled)" : "ปิดใช้งาน (Disabled)";
        toast.success(message);
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        toast.error("อัพเดทสถานะไม่สำเร็จ (Update Failed)");
      })
      .finally(() => setUpdatingId(null));
  };

  const handleChangeUserRole = (userId, userRole) => {
    setUpdatingId(userId);
    const value = {
      id: userId,
      role: userRole,
    };
    changeUserRole(token, value)
      .then((res) => {
        handleGetUsers(token);
        toast.success(`เปลี่ยนสิทธิ์เรียบร้อย (Role updated to ${userRole})`);
      })
      .catch((err) => {
        console.error("Error updating role:", err);
        toast.error("อัพเดทสิทธิ์ไม่สำเร็จ (Update Failed)");
      })
      .finally(() => setUpdatingId(null));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch (e) {
        return "-";
    }
  };

  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const emailMatch = user?.email?.toLowerCase().includes(searchLower);
        const nameMatch = user?.name?.toLowerCase().includes(searchLower);
        return emailMatch || nameMatch;
    })
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-t-xl p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-blue-600 w-8 h-8" /> 
            จัดการผู้ใช้งาน (User Management)
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                จัดการสิทธิ์และสถานะสมาชิก (Manage Roles & Status)
            </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
                type="text"
                placeholder="ค้นหาอีเมล หรือ ชื่อ (Search)..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-md rounded-b-xl overflow-hidden border border-gray-200 border-t-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="p-4 w-16 text-center">ลำดับ (No.)</th>
                <th className="p-4">ข้อมูลผู้ใช้ (User Info)</th>
                <th className="p-4 text-center">สิทธิ์ (Role)</th>
                <th className="p-4 text-center">สถานะ (Status)</th>
                <th className="p-4 text-center">จัดการ (Actions)</th>
                <th className="p-4 text-right">อัพเดทล่าสุด (Last Updated)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? filteredUsers.map((el, i) => (
                <tr key={el.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                  <td className="p-4 text-center text-gray-400 font-mono text-xs">{i + 1}</td>
                  
                  {/* User Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase shadow-sm">
                            {el.email ? String(el.email).substring(0, 2).toUpperCase() : "??"}
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{el.email || "No Email"}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                {el.name ? el.name : `ID: ${el.id}`}
                            </p>
                        </div>
                    </div>
                  </td>

                  {/* Role Dropdown */}
                  <td className="p-4 text-center">
                    <div className="inline-block relative">
                        <select
                            onChange={(e) => handleChangeUserRole(el.id, e.target.value)}
                            value={el.role}
                            disabled={updatingId === el.id}
                            className={`
                                appearance-none pl-8 pr-4 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer outline-none border transition-all
                                ${el.role === 'admin' 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}
                                ${updatingId === el.id ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <option value="user">ผู้ใช้ทั่วไป (User)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {updatingId === el.id ? (
                                <Loader2 size={14} className="animate-spin text-gray-500" />
                            ) : (
                                el.role === 'admin' 
                                    ? <ShieldAlert size={14} className="text-indigo-600"/> 
                                    : <ShieldCheck size={14} className="text-gray-500"/>
                            )}
                        </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-center">
                    <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${el.enable 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'}
                    `}>
                       <Dot size={16} className={`${el.enable ? 'text-emerald-500' : 'text-rose-500'}`} />
                       {el.enable ? "ปกติ (Active)" : "ระงับ (Inactive)"}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="p-4 text-center">
                    <button
                        onClick={() => handleChangeUserStatus(el.id, el.enable)}
                        disabled={updatingId === el.id}
                        className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                            ${el.enable ? 'bg-blue-600' : 'bg-gray-200'}
                            ${updatingId === el.id ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${el.enable ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                  </td>

                  {/* Updated At */}
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(el.updatedAt)}
                        </span>
                        <span className="text-[10px] text-gray-400">อัพเดทโดยระบบ (System)</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Users size={48} className="text-gray-200"/>
                            <p>ไม่พบข้อมูล (No Data)</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
            <p>แสดงทั้งหมด {filteredUsers.length} รายการ (Total Users)</p>
        </div>
      </div>
    </div>
  );
};

export default TableUsers;