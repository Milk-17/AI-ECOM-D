import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { getOrdersAdmin } from "../../api/admin"; // ใช้ API กลาง
import { numberFormat } from "../../utils/number";
import { Loader, MapPin } from "lucide-react";

const RecentOrders = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersAdmin(token);
      
      // ดึงข้อมูล (รองรับทั้ง Array และ Object)
      let orderList = [];
      if (Array.isArray(res.data)) orderList = res.data;
      else if (res.data && Array.isArray(res.data.orders)) orderList = res.data.orders;

      // ตัดเอาแค่ 5 รายการล่าสุด
      const recentFive = orderList
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setOrders(recentFive);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    } finally {
        setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Not Process": return "รอตรวจสอบ";
      case "Processing": return "กำลังดำเนินการ";
      case "Completed": return "จัดส่งสำเร็จ";
      case "Cancelled": return "ยกเลิก";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Process": return "bg-gray-100 text-gray-700 border-gray-200";
      case "Processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
      return <div className="p-4 flex justify-center"><Loader className="animate-spin text-blue-500"/></div>
  }

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
      <h2 className="text-lg font-bold mb-4 text-gray-800">คำสั่งซื้อล่าสุด (Recent Orders)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">ลูกค้า</th>
                    <th className="px-4 py-3">วันที่</th>
                    <th className="px-4 py-3 text-right">ยอดรวม</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {orders.length > 0 ? (
                    orders.map((o, index) => (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-500">#{index + 1}</td>
                            <td className="px-4 py-3">
                                <div className="font-semibold text-gray-800">{o.orderedBy?.email || 'N/A'}</div>
                                {/* แสดงที่อยู่ Snapshot แบบย่อ */}
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 max-w-[200px] truncate" title={o.shippingAddress}>
                                    <MapPin size={12} />
                                    {o.shippingAddress || 'ไม่ระบุที่อยู่'}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                            <td className="px-4 py-3 text-right font-medium text-blue-600">
                                {numberFormat(o.cartTotal)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(o.orderStatus)}`}>
                                    {getStatusText(o.orderStatus)}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">ไม่มีข้อมูลล่าสุด</td></tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;