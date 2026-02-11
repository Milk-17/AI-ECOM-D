import React, { useState } from "react";
import { numberFormat } from "../../utils/number";
import { Loader, MapPin, Edit2, Save, X, ChevronDown, ChevronUp, Package, Phone, User } from "lucide-react";
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
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows

  const toggleRowExpansion = (orderId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
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


  const handleTrackingInput = (e, orderId) => {
    const value = e.target.value;
    // อนุญาตเฉพาะตัวเลข (0-9) และ - เท่านั้น
    const filteredValue = value.replace(/[^0-9-]/g, "");

    // เรียก handleTrackingChange กับค่าที่กรอง
    handleTrackingChange({ target: { value: filteredValue } }, orderId);
  };

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
              <React.Fragment key={item.id || index}>
                <tr className="border-b hover:bg-gray-50 transition duration-150">
                  <td className="p-3 text-center">{index + 1}</td>

                  <td className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-800">
                          {item.orderedBy?.email || "Guest / Deleted User"}
                        </div>
                        <div
                          className="text-xs text-gray-500 mt-1 max-w-[220px] truncate flex items-center gap-1"
                          title={item.shippingAddress || item.orderedBy?.address}
                        >
                          <MapPin size={12} className="flex-shrink-0" />
                          {item.shippingAddress || item.orderedBy?.address || "-"}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleRowExpansion(item.id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="ดูรายละเอียดที่อยู่"
                      >
                        {expandedRows.has(item.id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
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

                  <td className="p-3 text-center">
                    {editingTrackingId === item.id ? (
                      <div className="flex gap-2 justify-center items-center">
                        <input
                          className="border border-blue-400 rounded-md p-1.5 text-xs w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                          placeholder="ระบุเลขพัสดุ"
                          onChange={(e) => handleTrackingInput(e, item.id)}
                          value={trackingInputs[item.id] || ""}
                          autoFocus
                        />
                        <button
                          className={`${
                            savingId === item.id
                              ? "bg-gray-500"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white p-1.5 rounded transition`}
                          onClick={() => handleSaveTracking(item.id)}
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

                {/* Expanded Row - Address Details */}
                {expandedRows.has(item.id) && (
                  <tr className="bg-blue-50 border-b border-blue-100">
                    <td colSpan="8" className="p-4">
                      <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Package className="text-blue-600" size={18} />
                          รายละเอียดที่อยู่จัดส่ง
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <User className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                              <div>
                                <span className="text-gray-500 text-xs">ผู้รับ:</span>
                                <p className="font-medium text-gray-800">
                                  {item.recipient || item.orderedBy?.name || "-"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Phone className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                              <div>
                                <span className="text-gray-500 text-xs">เบอร์โทร:</span>
                                <p className="font-medium text-gray-800">
                                  {item.phone || "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                              <div className="flex-1">
                                <span className="text-gray-500 text-xs">ที่อยู่เต็ม:</span>
                                <p className="font-medium text-gray-800 leading-relaxed">
                                  {item.shippingAddress || item.orderedBy?.address || "-"}
                                </p>
                                
                                {(item.province || item.district || item.subDistrict || item.zipcode) && (
                                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                                    {item.subDistrict && <p>ตำบล/แขวง: {item.subDistrict}</p>}
                                    {item.district && <p>อำเภอ/เขต: {item.district}</p>}
                                    {item.province && <p>จังหวัด: {item.province}</p>}
                                    {item.zipcode && <p>รหัสไปรษณีย์: {item.zipcode}</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
