import { useState, Fragment } from "react";
import { numberFormat } from "../../utils/number";
import { Loader, MapPin, Edit2, Save, X, ChevronDown, ChevronUp, Package, Phone, User, Navigation } from "lucide-react";
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
      <table className="w-full text-left border-collapse min-w-[900px]">
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
              <Fragment key={item.id || index}>
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
                          title={item.shippingAddress || "-"}
                        >
                          <MapPin size={12} className="flex-shrink-0" />
                          {item.shippingAddress || "-"}
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

                {/* Expanded Row - Shipping Address for THIS order */}
                {expandedRows.has(item.id) && (
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <td colSpan="8" className="p-4">
                      {item.shippingAddress ? (
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-200">
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                            <Navigation className="text-blue-600" size={16} />
                            ที่อยู่จัดส่ง (คำสั่งซื้อนี้)
                          </h4>
                          {(() => {
                            // parse shippingAddress snapshot: "ผู้รับ: xxx เบอร์โทร: xxx ที่อยู่: xxx ตำบล/แขวง: xxx อำเภอ/เขต: xxx จังหวัด: xxx รหัสไปรษณีย์: xxx"
                            const text = item.shippingAddress;
                            const extract = (label) => {
                              const regex = new RegExp(label + ":\\s*([^\\n]*?)(?=\\s+(?:ผู้รับ|เบอร์โทร|ที่อยู่|ตำบล|อำเภอ|จังหวัด|รหัสไปรษณีย์):|$)");
                              const match = text.match(regex);
                              return match ? match[1].trim() : null;
                            };
                            const recipient = extract("ผู้รับ");
                            const phone = extract("เบอร์โทร");
                            const addr = extract("ที่อยู่");
                            const subDistrict = extract("ตำบล/แขวง");
                            const district = extract("อำเภอ/เขต");
                            const province = extract("จังหวัด");
                            const zipcode = extract("รหัสไปรษณีย์");
                            const hasParsed = recipient || phone || addr || subDistrict || district || province || zipcode;

                            if (!hasParsed) {
                              // fallback: แสดงเป็น text ธรรมดา
                              return (
                                <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 rounded-lg p-3 border border-blue-100">
                                  {text}
                                </p>
                              );
                            }

                            return (
                              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm">
                                {/* ผู้รับ & เบอร์โทร */}
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-3">
                                  {recipient && recipient !== "ไม่ระบุ" && (
                                    <div className="flex items-center gap-1.5">
                                      <User className="text-blue-500 flex-shrink-0" size={15} />
                                      <span className="font-semibold text-gray-800">{recipient}</span>
                                    </div>
                                  )}
                                  {phone && phone !== "ไม่ระบุ" && (
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="text-blue-500 flex-shrink-0" size={15} />
                                      <span className="text-gray-700">{phone}</span>
                                    </div>
                                  )}
                                </div>

                                {/* ที่อยู่ */}
                                {addr && (
                                  <div className="flex items-start gap-1.5 mb-3">
                                    <MapPin className="text-blue-500 flex-shrink-0 mt-0.5" size={15} />
                                    <span className="text-gray-700 leading-relaxed">{addr}</span>
                                  </div>
                                )}

                                {/* ตำบล / อำเภอ / จังหวัด / ไปรษณีย์ */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 pt-3 border-t border-dashed border-blue-200">
                                  {subDistrict && (
                                    <div>
                                      <span className="text-[11px] text-gray-400 uppercase tracking-wider">ตำบล/แขวง</span>
                                      <p className="text-gray-700 font-medium text-xs">{subDistrict}</p>
                                    </div>
                                  )}
                                  {district && (
                                    <div>
                                      <span className="text-[11px] text-gray-400 uppercase tracking-wider">อำเภอ/เขต</span>
                                      <p className="text-gray-700 font-medium text-xs">{district}</p>
                                    </div>
                                  )}
                                  {province && (
                                    <div>
                                      <span className="text-[11px] text-gray-400 uppercase tracking-wider">จังหวัด</span>
                                      <p className="text-gray-700 font-medium text-xs">{province}</p>
                                    </div>
                                  )}
                                  {zipcode && (
                                    <div>
                                      <span className="text-[11px] text-gray-400 uppercase tracking-wider">รหัสไปรษณีย์</span>
                                      <p className="text-gray-700 font-medium text-xs">{zipcode}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
                          <MapPin className="text-gray-300 mx-auto mb-2" size={24} />
                          <p className="text-sm text-gray-400">ไม่พบข้อมูลที่อยู่จัดส่ง</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
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
