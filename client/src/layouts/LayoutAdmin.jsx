import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideberAdmin from '../components/admin/SideberAdmin'
import HeaderAdmin from '../components/admin/HeaderAdmin'

const LayoutAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  
  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
         {/* Sidebar - Desktop: ซ้ายตลอด, Mobile: แสดงเมื่อ toggle */}
         <SideberAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

         {/* Overlay สำหรับ Mobile */}
         {isSidebarOpen && (
           <div 
             className='fixed inset-0 bg-black/50 z-30 lg:hidden'
             onClick={() => setIsSidebarOpen(false)}
           />
         )}

         <div className='flex-1 flex flex-col overflow-hidden'>        
         <HeaderAdmin onMenuClick={toggleSidebar} />

         <main className='flex-1 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 overflow-y-auto'>
         <Outlet />
         </main>
         </div>
    </div>
  )
}

export default LayoutAdmin