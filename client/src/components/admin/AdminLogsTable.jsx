import { useState, useEffect } from "react";
import { getAdminLogs } from "../../api/admin"; // (สมมติว่าคุณมี API นี้แล้ว)
import useEcomStore from "../../store/ecom-store";
import { Loader, Search } from "lucide-react";

const AdminLogsTable = () => {
  const token = useEcomStore((state) => state.token);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับ Filter วันที่
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  useEffect(() => {
    handleGetLogs();
  }, [token]);

  const handleGetLogs = async () => {
    setLoading(true);
    try {
        // ถ้ายังไม่มี API นี้ ให้สร้างใน backend ก่อนนะครับ
        // หรือถ้าไม่มี ให้ใช้ array ว่างไปก่อนเพื่อดู UI: setLogs([]) 
        const res = await getAdminLogs(token); 
        setLogs(res.data);
    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
  };

  // ฟังก์ชันกรองข้อมูลตามวันที่
  const filteredLogs = logs.filter((item) => {
      if (!dateStart && !dateEnd) return true; // ถ้าไม่เลือกวัน ให้โชว์หมด
      
      const logDate = new Date(item.createdAt);
      const start = dateStart ? new Date(dateStart) : null;
      const end = dateEnd ? new Date(dateEnd) : null;

      // Set เวลาของ End date ให้เป็น 23:59:59 เพื่อให้ครอบคลุมทั้งวัน
      if (end) end.setHours(23, 59, 59, 999);

      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      
      return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) return <div className="flex justify-center p-4"><Loader className="animate-spin" /></div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800">ประวัติการใช้งาน (Admin Logs)</h2>
            
            {/* --- Date Filter Inputs --- */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                <span className="text-sm text-gray-500">เลือกช่วงเวลา:</span>
                <input 
                    type="date" 
                    value={dateStart} 
                    onChange={(e) => setDateStart(e.target.value)}
                    className="border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date" 
                    value={dateEnd} 
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                />
                {(dateStart || dateEnd) && (
                    <button 
                        onClick={() => { setDateStart(""); setDateEnd(""); }}
                        className="ml-2 text-xs text-red-500 hover:underline"
                    >
                        ล้างค่า
                    </button>
                )}
            </div>
            {/* ------------------------- */}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="p-3 border-b">วันที่</th>
                        <th className="p-3 border-b">Admin</th>
                        <th className="p-3 border-b">การกระทำ (Action)</th>
                        <th className="p-3 border-b">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <tr key={log.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                                <td className="p-3 font-semibold">{log.admin?.name || log.admin?.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs border ${
                                        log.action === 'create' ? 'bg-green-100 text-green-700 border-green-200' :
                                        log.action === 'delete' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600">{log.message}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="p-8 text-center text-gray-400">
                                ไม่พบประวัติในช่วงเวลานี้
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AdminLogsTable;