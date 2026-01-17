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
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Package size={32} /> ประวัติการสั่งซื้อ
        </h1>
        <p className="text-blue-100 mt-2 text-sm">ติดตามและตรวจสอบคำสั่งซื้อของคุณได้ที่นี่</p>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 text-gray-500 shadow-sm">
          <div className="bg-blue-100 p-6 rounded-full mb-4">
            <AlertCircle size={48} className="text-blue-600" />
          </div>
          <p className="text-xl font-bold mb-2 text-gray-800">คุณยังไม่มีประวัติการสั่งซื้อ</p>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-md">เริ่มช้อปปิ้งสินค้าที่คุณถูกใจได้เลย เราพร้อมส่งถึงมือคุณ!</p>
          <Link to="/shop">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold">
                <ShoppingBag size={20} /> เริ่มช้อปปิ้ง
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 md:p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar size={18} className="text-blue-600" />
                      <span>วันที่สั่งซื้อ: <span className="font-bold">{formatDate(item.createdAt)}</span></span>
                    </div>

                    {/* แสดงเลขพัสดุ (ถ้ามี) */}
                    {item.trackingNumber && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-2 rounded-lg w-fit border border-blue-200 shadow-sm">
                          <Truck size={18} />
                          <span className="font-mono">เลขพัสดุ: {item.trackingNumber}</span>
                      </div>
                    )}
                    
                    {item.shippingAddress && (
                      <div className="flex items-start gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 mt-2">
                          <MapPin size={18} className="mt-0.5 flex-shrink-0 text-gray-500" />
                          <span className="leading-relaxed">
                              {item.shippingAddress}
                          </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap shadow-sm ${getStatusColor(item.orderStatus)}`}>
                      {item.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="p-4 md:p-6">
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3">สินค้า</th>
                        <th className="px-4 py-3 text-right">ราคา</th>
                        <th className="px-4 py-3 text-center">จำนวน</th>
                        <th className="px-4 py-3 text-right">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {item.products?.map((product, i) => (
                        <tr key={i} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-800">
                              {product.product.title}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                              {numberFormat(product.price)}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-gray-700">
                              {product.count}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {numberFormat(product.count * product.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Footer with Gradient */}
                <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-xl border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1 font-medium">ยอดรวมสุทธิ</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {numberFormat(item.cartTotal)} <span className="text-sm font-normal text-gray-500">บาท</span>
                    </p>
                  </div>
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