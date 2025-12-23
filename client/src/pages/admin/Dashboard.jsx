// src/pages/admin/Dashboard.jsx
// ======= Start Fix: ปรับหน้า Dashboard เพิ่ม Section =======
import React from 'react'
import DashboardStats from '../../components/admin/DashboardStats'


const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* ส่วนแสดงสถิติรวม */}
      <DashboardStats />
    </div>
  )
}

export default Dashboard
// ======= End Fix =======