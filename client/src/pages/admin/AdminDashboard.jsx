import React from 'react'
import RecentOrders from '../../components/admin/RecentOrders'
import PendingOrders from '../../components/admin/PendingOrders'
import AdminLogsTable from '../../components/admin/AdminLogsTable'

const AdminDashboard = () => {
    return (
        <div className="p-6 space-y-6">
       
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ออเดอร์ล่าสุด */}
            <RecentOrders />
    
            {/* ออเดอร์ที่ยังไม่จัดส่ง */}
            <PendingOrders />
          </div>
    
          {/* Log Admin */}
          <AdminLogsTable />
        </div>
      )
}

export default AdminDashboard