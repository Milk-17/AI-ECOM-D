import React, { useEffect, useState } from "react";
import { getOrdersAdmin, changeOrderStatus } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { Truck } from "lucide-react";

// Import Components ที่แยกออกมา
import OrderFilter from "./OrderFilter";
import OrderTable from "./OrderTable";

const TableOrders = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState({});
  const [tab, setTab] = useState("All");

  

  useEffect(() => {
    handleGetOrder(token);
  }, []);

  const handleGetOrder = (token) => {
    setLoading(true);
    getOrdersAdmin(token)
      .then((res) => {
        // Correctness: ตรวจสอบ Data Structure ให้รองรับทั้ง Array และ Object
        let orderList = [];
        if (Array.isArray(res.data)) {
            orderList = res.data;
        } else if (res.data && Array.isArray(res.data.orders)) {
            orderList = res.data.orders;
        }
        
        // Sort: ใหม่ล่าสุดขึ้นก่อน
        const sortedOrders = orderList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      })
      .catch((err) => {
        console.log(err);
        toast.error("โหลดข้อมูลไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
  };

  const handleChangeOrderStatus = (token, orderId, orderStatus) => {
    const trackingNumber = trackingInputs[orderId] || "";
    
    // Security: ส่ง Token เสมอ
    changeOrderStatus(token, orderId, orderStatus, trackingNumber)
      .then((res) => {
        toast.success("อัปเดตสถานะเรียบร้อย!");
        handleGetOrder(token);
        
        // Clear input ของแถวนั้นเมื่อบันทึกเสร็จ
        setTrackingInputs((prev) => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("เกิดข้อผิดพลาดในการอัปเดต");
      });
  };

  const handleTrackingChange = (e, orderId) => {
    setTrackingInputs({
      ...trackingInputs,
      [orderId]: e.target.value,
    });
  };

  // Logic: กรองข้อมูลตาม Tab ก่อนส่งไปแสดงผล
  const filteredOrders = orders.filter((item) => {
    if (tab === "All") return true;
    return item.orderStatus === tab;
  });

  const handleSaveTrackingSuccess = (updatedOrders) => {
    setOrders(updatedOrders); //  อัพเดท orders หลัก
    //  filteredOrders จะอัพเดทอัตโนมัติจากการ re-render เพราะ dependency
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Truck className="text-blue-600" /> จัดการคำสั่งซื้อ (Order Management)
      </h2>

      {/* 1. Component ตัวกรอง (ส่ง orders ทั้งหมดไปเพื่อนับจำนวน badge) */}
      <OrderFilter 
        orders={orders} 
        currentTab={tab} 
        setTab={setTab} 
      />

      {/* 2. Component ตาราง (ส่งเฉพาะข้อมูลที่กรองแล้วไปแสดง) */}
      <OrderTable
        orders={filteredOrders}
        trackingInputs={trackingInputs}
        handleTrackingChange={handleTrackingChange}
        handleChangeOrderStatus={handleChangeOrderStatus}
        loading={loading}
        token={token}
        onSaveSuccess={handleSaveTrackingSuccess}
      />
    </div>
  );
};

export default TableOrders;