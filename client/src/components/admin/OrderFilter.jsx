import { ListFilter, Clock, Package, CheckCircle, XCircle } from "lucide-react";

const OrderFilter = ({ orders, currentTab, setTab }) => {
  // กำหนด Config ของ Tabs ไว้ที่นี่ แก้ไขง่าย
  const tabs = [
    { id: "All", label: "ทั้งหมด", icon: ListFilter, color: "blue" },
    { id: "Not Process", label: "รอตรวจสอบ", icon: Clock, color: "gray" },
    { id: "Processing", label: "กำลังดำเนินการ", icon: Package, color: "blue" },
    { id: "Completed", label: "จัดส่งสำเร็จ", icon: CheckCircle, color: "green" },
    { id: "Cancelled", label: "ยกเลิก", icon: XCircle, color: "red" },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {tabs.map((t) => {
        // Correctness: นับจำนวน Order ในแต่ละสถานะให้ถูกต้อง
        const count = orders.filter((o) =>
          t.id === "All" ? true : o.orderStatus === t.id
        ).length;
        
        const isActive = currentTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${t.color}-300
                ${
                  isActive
                    ? `bg-${t.color}-50 border-${t.color}-500 text-${t.color}-700 shadow-sm ring-1 ring-${t.color}-200`
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
          >
            <t.icon size={18} />
            <span className="font-medium">{t.label}</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full 
                ${
                  isActive
                    ? `bg-${t.color}-200 text-${t.color}-800`
                    : "bg-gray-100 text-gray-500"
                }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default OrderFilter;