import React from 'react'
import { Outlet } from 'react-router-dom'
import SideberAdmin from '../components/admin/SideberAdmin'
import HeaderAdmin from '../components/admin/HeaderAdmin'

const LayoutAdmin = () => {
  return (
    <div className='flex h-screen bg-gray-50'>
         <SideberAdmin />

         <div className='flex-1 flex flex-col'>        
         <HeaderAdmin />

         <main className='flex-1 p-6 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 overflow-y-auto'>
         <Outlet />
         </main>
         </div>
    </div>
  )
}

export default LayoutAdmin