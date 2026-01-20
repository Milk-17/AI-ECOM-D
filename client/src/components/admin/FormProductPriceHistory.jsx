import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader, History, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { numberFormat } from "../../utils/number";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const FormProductPriceHistory = () => {
  const token = useEcomStore((state) => state.token);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/productpricehistory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Cannot fetch price history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (num) => {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 0 });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <History className="text-blue-600" /> ประวัติการปรับราคา (Price Log)
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {/* table-fixed: บังคับความกว้างให้ตรงตาม % ที่กำหนด */}
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
            <tr>
              <th className="p-3 border-b text-center w-[5%]">ลำดับ</th>
              
              {/* มาตรฐาน: ชื่อสินค้าชิดซ้าย */}
              <th className="p-3 border-b text-left w-[35%]">สินค้า</th>
              
              {/* มาตรฐาน: ราคาชิดขวา */}
              <th className="p-3 border-b text-right w-[12%]">ราคาเก่า</th>
              
              <th className="p-3 border-b text-center w-[6%]"></th>
              
              {/* มาตรฐาน: ราคาชิดขวา */}
              <th className="p-3 border-b text-right w-[12%]">ราคาใหม่</th>
              
              <th className="p-3 border-b text-center w-[15%]">วันที่ปรับเปลี่ยน</th>
              <th className="p-3 border-b text-center w-[15%]">ผู้ดำเนินการ</th>
            </tr>
          </thead>
          
          <tbody className="text-sm text-gray-600">
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  ไม่มีประวัติการปรับราคา
                </td>
              </tr>
            ) : (
              history.map((h, index) => {
                const isPriceUp = h.newPrice > h.oldPrice;
                const isPriceDown = h.newPrice < h.oldPrice;

                return (
                  <tr key={h.id} className="hover:bg-gray-50 transition duration-150 border-b last:border-0">
                    <td className="p-3 text-center align-middle">{index + 1}</td>
                    
                    {/* ชื่อสินค้า: ชิดซ้าย */}
                    <td className="p-3 align-middle text-left">
                      <div className="truncate font-medium text-gray-800" title={h.product?.title}>
                         {h.product?.title || "Unknown Product"}
                      </div>
                    </td>

                    {/* ราคาเก่า: ชิดขวา */}
                    <td className="p-3 text-right align-middle text-gray-500 line-through font-mono">
                      {formatPrice(h.oldPrice)}
                    </td>

                    <td className="p-3 text-center align-middle">
                        <div className="flex justify-center items-center">
                          {isPriceUp && <TrendingUp size={16} className="text-red-500" />}
                          {isPriceDown && <TrendingDown size={16} className="text-green-500" />}
                          {!isPriceUp && !isPriceDown && <span className="text-gray-300">-</span>}
                        </div>
                    </td>

                    {/* ราคาใหม่: ชิดขวา */}
                    <td className={`p-3 text-right align-middle font-mono font-bold ${
                        isPriceUp ? "text-red-600" : isPriceDown ? "text-green-600" : "text-gray-800"
                    }`}>
                      {formatPrice(h.newPrice)}
                    </td>

                    <td className="p-3 text-center align-middle text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(h.changedAt)}
                    </td>

                    <td className="p-3 text-center align-middle">
                      <div className="truncate mx-auto max-w-[140px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs border" title={h.changedBy?.email}>
                        {h.changedBy?.email || "Unknown"}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormProductPriceHistory;