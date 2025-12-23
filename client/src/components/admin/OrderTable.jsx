import React, { useState } from "react";
import { numberFormat } from "../../utils/number";
import { Loader, MapPin, Edit2, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { updateTrackingNumber } from "../../api/admin";

const OrderTable = ({
  orders,
  trackingInputs,
  handleTrackingChange,
  handleChangeOrderStatus,
  loading,
  token,  // รับ token เข้ามาเพื่อใช้ส่ง API
  onSaveSuccess, 
}) => {
  // Standard: แยกฟังก์ชัน Helper สำหรับสีสถานะ
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
        return "bg-gray-100 text-gray-600";
    }
  };

  const [editingTrackingId, setEditingTrackingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

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

  // ✅ กรองให้เฉพาะตัวเลขและ - เท่านั้น
  const handleTrackingInput = (e, orderId) => {
    const value = e.target.value;
    // อนุญาตเฉพาะตัวเลข (0-9) และ - เท่านั้น
    const filteredValue = value.replace(/[^0-9-]/g, "");

    // เรียก handleTrackingChange กับค่าที่กรอง
    handleTrackingChange({ target: { value: filteredValue } }, orderId);
  };

  // ✅ ฟังก์ชันบันทึกเลขพัสดุ
  const handleSaveTracking = async (orderId) => {
    const trackingNumber = trackingInputs[orderId];

    if (!trackingNumber || trackingNumber.trim() === "") {
      toast.warning("กรุณาระบุเลขพัสดุ");
      return;
    }

    setSavingId(orderId);
    try {
      const res = await updateTrackingNumber(token, orderId, trackingNumber);
      if (res.status === 200) {
        toast.success("บันทึกเลขพัสดุสำเร็จ");
        
        //  อัพเดท orders แบบทันที (ไม่ต้อง F5)
        const updatedOrders = orders.map(order =>
          order.id === orderId
            ? { ...order, trackingNumber: trackingNumber }
            : order
        );
        
        //  เรียก callback เพื่อบอก parent ว่าอัพเดท
        if (onSaveSuccess) {
          onSaveSuccess(updatedOrders);
        }
        
        setEditingTrackingId(null);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
      console.log(error);
    } finally {
      setSavingId(null);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th className="p-3 border-b text-center">ลำดับ</th>
            <th className="p-3 border-b">ผู้ใช้งาน</th>
            <th className="p-3 border-b text-center">วันที่</th>
            <th className="p-3 border-b">สินค้า</th>
            <th className="p-3 border-b text-right">ยอดรวม</th>
            <th className="p-3 border-b text-center">เลขพัสดุ</th>
            <th className="p-3 border-b text-center">สถานะ</th>
            <th className="p-3 border-b text-center">จัดการ</th>
          </tr>
        </thead>

        <tbody className="text-sm text-gray-600">
          {orders.length > 0 ? (
            orders.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="p-3 text-center">{index + 1}</td>

                <td className="p-3">
                  {/* Security: ใช้ Optional Chaining (?) ป้องกัน Error กรณี user ถูกลบ */}
                  <div className="font-bold text-gray-800">
                    {item.orderedBy?.email || "Guest / Deleted User"}
                  </div>

                  {/* Correctness: แสดงที่อยู่จาก Snapshot (shippingAddress) ก่อนเสมอ */}
                  <div
                    className="text-xs text-gray-500 mt-1 max-w-[220px] truncate flex items-center gap-1"
                    title={item.shippingAddress || item.orderedBy?.address}
                  >
                    <MapPin size={12} className="flex-shrink-0" />
                    {item.shippingAddress || item.orderedBy?.address || "-"}
                  </div>
                </td>

                <td className="p-3 text-center text-xs whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>

                <td className="p-3">
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                    {item.products?.map((product, idx) => (
                      <li key={idx}>
                        <span className="font-medium">
                          {product.product?.title}
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          ({product.count} x {numberFormat(product.price)})
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>

                <td className="p-3 text-right font-bold text-blue-600 whitespace-nowrap">
                  {numberFormat(item.cartTotal)}
                </td>

                {/* ✅ แก้ไขส่วนเลขพัสดุ */}
                <td className="p-3 text-center">
                  {editingTrackingId === item.id ? (
                    // โหมดแก้ไข
                    <div className="flex gap-2 justify-center items-center">
                      <input
                        className="border border-blue-400 rounded-md p-1.5 text-xs w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        placeholder="ระบุเลขพัสดุ"
                        onChange={(e) => handleTrackingInput(e, item.id)} //  ใช้ฟังก์ชันใหม่
                        value={trackingInputs[item.id] || ""}
                        autoFocus
                      />
                      <button
                        className={`${
                          savingId === item.id
                            ? "bg-gray-500"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white p-1.5 rounded transition`}
                        onClick={() => handleSaveTracking(item.id)} //  เรียก API
                        title="บันทึก"
                        disabled={savingId === item.id}
                      >
                        <Save size={16} />
                      </button>
                      <button
                        className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded transition"
                        onClick={() => {
                          setEditingTrackingId(null);
                          handleTrackingChange(
                            { target: { value: "" } },
                            item.id
                          );
                        }}
                        title="ยกเลิก"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    // โหมดแสดง
                    <div className="flex gap-2 justify-center items-center">
                      <span className="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {item.trackingNumber || "-"}
                      </span>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded transition"
                        onClick={() => setEditingTrackingId(item.id)}
                        title="แก้ไข"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </td>

                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusColor(
                      item.orderStatus
                    )}`}
                  >
                    {item.orderStatus}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <select
                    value={item.orderStatus}
                    onChange={(e) =>
                      handleChangeOrderStatus(token, item.id, e.target.value)
                    }
                    className="border border-gray-300 bg-white text-gray-700 text-xs rounded-md p-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Not Process">รอตรวจสอบ</option>
                    <option value="Processing">กำลังดำเนินการ</option>
                    <option value="Completed">จัดส่งสำเร็จ</option>
                    <option value="Cancelled">ยกเลิก</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="p-8 text-center text-gray-400 bg-gray-50"
              >
                ไม่มีรายการคำสั่งซื้อในสถานะนี้
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
