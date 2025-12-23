import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { getOrdersAdmin } from "../../api/admin";
import { ShoppingCart, DollarSign, Package, CheckCircle, Clock, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { numberFormat } from "../../utils/number";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const DashboardStats = () => {
  const token = useEcomStore((state) => state.token);
  const [stats, setStats] = useState({ 
      // ยอดเงิน
      todaySales: 0,
      monthSales: 0,
      totalSales: 0, 
      // จำนวนออเดอร์
      todayOrders: 0,
      monthOrders: 0,
      totalOrders: 0, 
      // สถานะ
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0 
  });
  const [salesData, setSalesData] = useState([]); 
  const [statusData, setStatusData] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
        fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOrdersAdmin(token);
      let orderList = [];
      if (Array.isArray(res.data)) orderList = res.data;
      else if (res.data && Array.isArray(res.data.orders)) orderList = res.data.orders;

      // --- 1. เตรียมตัวแปรวันที่ ---
      const now = new Date();
      const todayStr = now.toDateString(); // เช่น "Thu Dec 18 2025"
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();

      // --- 2. วนลูปคำนวณรอบเดียวจบ ---
      const calculated = orderList.reduce((acc, order) => {
        const orderDate = new Date(order.createdAt);
        const orderCartTotal = order.cartTotal;

        // A. ยอดรวมทั้งหมด (All Time)
        acc.totalSales += orderCartTotal;
        acc.totalOrders += 1;

        // B. เช็ครายวัน (Today)
        if (orderDate.toDateString() === todayStr) {
            acc.todaySales += orderCartTotal;
            acc.todayOrders += 1;
        }

        // C. เช็ครายเดือน (This Month)
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            acc.monthSales += orderCartTotal;
            acc.monthOrders += 1;
        }

        // D. เช็คสถานะ
        if (order.orderStatus === 'Not Process') acc.pendingOrders += 1;
        if (order.orderStatus === 'Processing') acc.processingOrders += 1;
        if (order.orderStatus === 'Completed') acc.completedOrders += 1;

        return acc;
      }, {
        totalSales: 0, totalOrders: 0,
        todaySales: 0, todayOrders: 0,
        monthSales: 0, monthOrders: 0,
        pendingOrders: 0, processingOrders: 0, completedOrders: 0
      });

      setStats(calculated);

      // --- 3. เตรียมกราฟแท่ง (รายวัน 7 วันล่าสุด) ---
      const salesByDate = {};
      orderList.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
          if (!salesByDate[date]) salesByDate[date] = 0;
          salesByDate[date] += order.cartTotal;
      });
      const barData = Object.keys(salesByDate).map(date => ({
          name: date,
          sales: salesByDate[date]
      })).slice(-7);
      setSalesData(barData);

      // --- 4. เตรียมกราฟโดนัท (สถานะ) ---
      const pieData = [
        { name: 'รอตรวจสอบ (Pending)', value: calculated.pendingOrders, color: '#F59E0B' }, 
        { name: 'กำลังดำเนินการ (Processing)', value: calculated.processingOrders, color: '#3B82F6' },
        { name: 'สำเร็จ (Completed)', value: calculated.completedOrders, color: '#10B981' },
        { name: 'ยกเลิก (Cancelled)', value: orderList.filter(o => o.orderStatus === 'Cancelled').length, color: '#EF4444' }
      ];
      setStatusData(pieData.filter(item => item.value > 0));

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return <div className="p-10 flex justify-center text-gray-400 animate-pulse">Loading Dashboard...</div>
  }

  return (
    <div>
       <h1 className="text-2xl font-bold text-gray-800 mb-6">ภาพรวมร้านค้า (Dashboard Overview)</h1>

        {/* --- Section 1: ยอดขาย (Sales Stats) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             {/* วันนี้ */}
             <StatCard 
                title="ยอดขายวันนี้ (Today Sales)" 
                value={numberFormat(stats.todaySales)} 
                subValue={`${stats.todayOrders} ออเดอร์`}
                icon={<DollarSign size={24} className="text-white" />} 
                color="bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
            {/* เดือนนี้ */}
            <StatCard 
                title="ยอดขายเดือนนี้ (Monthly Sales)" 
                value={numberFormat(stats.monthSales)} 
                subValue={`${stats.monthOrders} ออเดอร์`}
                icon={<Calendar size={24} className="text-white" />} 
                color="bg-gradient-to-r from-blue-500 to-blue-400"
            />
            {/* ทั้งหมด */}
            <StatCard 
                title="ยอดขายรวม (Total Sales)" 
                value={numberFormat(stats.totalSales)} 
                subValue={`${stats.totalOrders} ออเดอร์`}
                icon={<CreditCard size={24} className="text-white" />} 
                color="bg-gradient-to-r from-purple-500 to-purple-400"
            />
        </div>

        {/* --- Section 2: สถานะออเดอร์ (Order Status) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCardSimple 
                title="คำสั่งซื้อรวม (Total Orders)" 
                value={stats.totalOrders} 
                icon={<ShoppingCart size={20} className="text-gray-600" />} 
            />
            <StatCardSimple 
                title="รอตรวจสอบ (Pending)" 
                value={stats.pendingOrders} 
                icon={<Clock size={20} className="text-yellow-600" />} 
                bgColor="bg-yellow-50 border-yellow-200"
                textColor="text-yellow-700"
            />
            <StatCardSimple 
                title="ดำเนินการ (Processing)" 
                value={stats.processingOrders} 
                icon={<Package size={20} className="text-blue-600" />} 
                bgColor="bg-blue-50 border-blue-200"
                textColor="text-blue-700"
            />
            <StatCardSimple 
                title="สำเร็จ (Completed)" 
                value={stats.completedOrders} 
                icon={<CheckCircle size={20} className="text-green-600" />} 
                bgColor="bg-green-50 border-green-200"
                textColor="text-green-700"
            />
        </div>

        {/* --- Section 3: Charts --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-700 mb-6">แนวโน้มยอดขาย (Sales Trend)</h3>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#9CA3AF'}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#9CA3AF'}} 
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [numberFormat(value), 'ยอดขาย (Sales)']}
                            />
                            <Bar 
                                dataKey="sales" 
                                fill="url(#colorSales)" 
                                radius={[8, 8, 0, 0]} 
                                barSize={50}
                                activeBar={{ fill: '#2563EB' }}
                                name="ยอดขาย (Sales)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-gray-700 mb-4 w-full text-left">สัดส่วนสถานะ (Status Ratio)</h3>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70} 
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                        <p className="text-xs text-gray-400">Order</p>
                    </div>
                </div>
                
                <div className="w-full mt-4 space-y-2">
                    {statusData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Component Card แบบที่ 1: เน้นยอดขาย (มีสีสัน) ---
const StatCard = ({ title, value, subValue, icon, color }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">{title}</p>
                <h2 className="text-2xl font-extrabold text-gray-800">{value}</h2>
                <p className="text-xs text-gray-400 mt-1">{subValue}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>
                {icon}
            </div>
        </div>
    )
}

// --- Component Card แบบที่ 2: เน้นสถานะ (เรียบง่าย) ---
const StatCardSimple = ({ title, value, icon, bgColor = "bg-gray-50", textColor = "text-gray-800" }) => {
    return (
        <div className={`rounded-xl p-4 border flex items-center justify-between ${bgColor} border-opacity-50`}>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
                <h2 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h2>
            </div>
            <div className="opacity-80">{icon}</div>
        </div>
    )
}

export default DashboardStats;