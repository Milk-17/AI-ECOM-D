import React from 'react'
import useEcomStore from '../../store/ecom-store'

const HeaderAdmin = () => {
  const user = useEcomStore((state) => state.user)

  return (
    <header className='bg-white text-gray-900 h-20 flex items-center justify-end px-8 shadow-md border-b border-gray-200'>
      {/* User Profile */}
      <div className='flex items-center gap-4'>
        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div>
          <p className='font-semibold text-gray-900 text-sm'>{user?.name || 'Admin'}</p>
          <p className='text-xs text-gray-500'>{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
        </div>
      </div>
    </header>
  )
}

export default HeaderAdmin