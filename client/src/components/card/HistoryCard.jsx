import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/user";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { toast } from "react-toastify";
import { Calendar, MapPin, Package, AlertCircle, ShoppingBag, Truck } from "lucide-react"; 
import { Link } from "react-router-dom";

const HistoryCard = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hdlGetOrders(token);
  }, []);

  const hdlGetOrders = async (token) => {
    setLoading(true);
    try {
      const res = await getOrders(token);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch orders!");
    } finally {
      setLoading(false);
    }
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
      case "Not Process":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "Processing":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-600 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Package className="text-blue-600" /> ประวัติการสั่งซื้อ
      </h1>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
          <AlertCircle size={48} className="mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">คุณยังไม่มีประวัติการสั่งซื้อ</p>
          <p className="text-sm text-gray-400 mb-6">เริ่มช้อปปิ้งสินค้าที่คุณถูกใจได้เลย!</p>
          <Link to="/shop">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md transition-colors flex items-center gap-2">
                <ShoppingBag size={18} /> เลือกซื้อสินค้า
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-2 w-full md:w-3/4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>วันที่สั่งซื้อ: {formatDate(item.createdAt)}</span>
                  </div>

                  {/* แสดงเลขพัสดุ (ถ้ามี) */}
                  {item.trackingNumber && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                        <Truck size={16} />
                        <span className="font-mono font-medium">เลขพัสดุ: {item.trackingNumber}</span>
                    </div>
                  )}
                  
                  {/* ✅ แก้ไขตรงนี้: ใช้ item.shippingAddress แทน orderedBy.address */}
                  {item.shippingAddress && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md mt-1">
                        <MapPin size={16} className="mt-1 flex-shrink-0 text-gray-500" />
                        <span className="leading-relaxed">
                            {/* แสดงที่อยู่ (Snapshot) */}
                            {item.shippingAddress}
                        </span>
                    </div>
                  )}
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusColor(item.orderStatus)}`}>
                    {getStatusText(item.orderStatus)}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">สินค้า</th>
                      <th className="px-4 py-3 text-right">ราคา</th>
                      <th className="px-4 py-3 text-center">จำนวน</th>
                      <th className="px-4 py-3 text-right">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {item.products?.map((product, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">
                            {product.product.title}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                            {numberFormat(product.price)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                            {product.count}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {numberFormat(product.count * product.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Footer */}
              <div className="flex justify-end items-center mt-4 pt-2">
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">ยอดรวมสุทธิ</p>
                  <p className="text-xl font-bold text-blue-600">
                    {numberFormat(item.cartTotal)} <span className="text-sm font-normal text-gray-500">บาท</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryCard;