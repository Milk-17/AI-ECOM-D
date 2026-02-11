import React from 'react'
import useEcomStore from '../../store/ecom-store'
import { Menu } from 'lucide-react'

const HeaderAdmin = ({ onMenuClick }) => {
  const user = useEcomStore((state) => state.user)

  return (
    <header className='bg-white text-gray-900 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-md border-b border-gray-200'>
      {/* Hamburger Menu (Mobile Only) */}
      <button
        onClick={onMenuClick}
        className='lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors'
        aria-label='Toggle menu'
      >
        <Menu size={24} className='text-gray-700' />
      </button>

      {/* Logo สำหรับ Mobile */}
      <div className='lg:hidden flex items-center'>
        <h2 className='text-lg font-bold text-gray-800'>Admin</h2>
      </div>

      {/* User Profile */}
      <div className='flex items-center gap-2 sm:gap-4 ml-auto'>
        <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base'>
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className='hidden sm:block'>
          <p className='font-semibold text-gray-900 text-sm'>{user?.name || 'Admin'}</p>
          <p className='text-xs text-gray-500'>{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
        </div>
      </div>
    </header>
  )
}

export default HeaderAdmin