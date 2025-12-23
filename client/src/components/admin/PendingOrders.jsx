// src/components/admin/PendingOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, User, Calendar, CreditCard, FileSearch } from "lucide-react"; // ใช้ Icon เพื่อความสวยงาม
import { numberFormat } from "../../utils/number"; // เรียกใช้ function จัดการตัวเลข (ถ้ามี)
// หรือถ้าไม่มี numberFormat ให้ใช้ .toLocaleString() เหมือนเดิมได้ครับ

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // ✅ ควรใช้ token ในการดึงข้อมูลด้วย (ถ้า API ฝั่ง Backend ล็อคไว้)
      // แต่ถ้า Code เดิมใช้ได้อยู่แล้ว ก็ใช้ตามนี้ครับ
      const res = await axios.get("http://localhost:5001/api/order/pending");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching pending orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ฟังก์ชันจัดรูปแบบวันที่ให้สวยงาม
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  if (loading) {
      return <div className="p-8 text-center text-gray-400 animate-pulse">กำลังโหลดข้อมูล... (Loading...)</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* --- Header --- */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
            <Clock size={20} />
        </div>
        <div>
            <h2 className="text-lg font-bold text-gray-800">คำสั่งซื้อรอตรวจสอบ (Pending Orders)</h2>
            <p className="text-xs text-gray-500">รายการที่ต้องดำเนินการตรวจสอบการชำระเงิน</p>
        </div>
      </div>

      {/* --- Table Content --- */}
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
            // --- Empty State (กรณีไม่มีออเดอร์ค้าง) ---
            <div className="text-center p-10">
                <div className="flex justify-center mb-3 text-gray-300">
                    <FileSearch size={48} />
                </div>
                <p className="text-gray-500 font-medium">ไม่มีรายการค้างตรวจสอบ (No Pending Orders)</p>
                <p className="text-sm text-gray-400">คำสั่งซื้อใหม่จะปรากฏที่นี่</p>
            </div>
        ) : (
            // --- Table Data ---
            <table className="min-w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-100">
                <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    รหัส (Order ID)
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ลูกค้า (Customer)
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    วันที่ (Date)
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    ยอดรวม (Total)
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    สถานะ (Status)
                </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                <tr key={o.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                    <td className="px-6 py-4 font-medium text-gray-800">
                        #{o.id}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                                <User size={14} />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                                {o.orderedBy?.name || o.orderedBy?.email || "Unknown"}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(o.createdAt)}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                        {/* ถ้ามี function numberFormat ให้ใช้แบบบรรทัดล่าง */}
                        {/* {numberFormat(o.cartTotal)} */}
                        {o.cartTotal.toLocaleString()} ฿
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            รอตรวจสอบ
                        </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default PendingOrders;