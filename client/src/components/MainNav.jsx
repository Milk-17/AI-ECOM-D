// client/src/components/MainNav.jsx
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import { User, ChevronDown, Menu, X, ShoppingCart } from "lucide-react";

function MainNav() {
  const carts = useEcomStore((s) => s.carts);
  const user = useEcomStore((s) => s.user);
  const logout = useEcomStore((s) => s.logout);

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // D1: Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-[60]">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={"/"} className="flex-shrink-0">
            {logoError ? (
              <span className="text-xl font-bold text-blue-600">SHOP</span>
            ) : (
              <img 
                src="/LOGO.png" 
                alt="Website Logo" 
                className="w-16 sm:w-20 h-auto"
                onError={() => setLogoError(true)}
              />
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium"
              }
              to={"/"}
            >
              หน้าหลัก
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium"
              }
              to={"/shop"}
            >
              รายการสินค้า
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium relative"
                  : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium relative"
              }
              to={"/cart"}
            >
              ตะกร้าสินค้า
              {carts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {carts.length}
                </span>
              )}
            </NavLink>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center justify-between gap-2 hover:bg-gray-200 px-3 py-2 rounded-full border border-gray-100 transition duration-150 shadow-sm min-w-[140px]"
                >
                  <div className="flex items-center gap-2">
                    {user.picture ? (
                      <img
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        src={user.picture}
                        alt="Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          // Fallback เป็น UI Avatar ที่สร้างจากชื่อผู้ใช้
                          const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
                          e.target.src = `https://ui-avatars.com/api/?name=${initial}&background=3b82f6&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                        <User size={18} />
                      </div>
                    )}

                    <span className="text-sm font-bold text-gray-700 truncate max-w-[80px]">
                      {user.name || user.email}
                    </span>
                  </div>

                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {isOpen && (
                  <div className="absolute top-14 right-0 bg-white shadow-lg z-50 w-48 rounded-md overflow-hidden border border-gray-100">
                    <Link
                      to={"/user/profile"}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 border-b text-sm"
                    >
                      โปรไฟล์
                    </Link>

                    <Link
                      to={"/user/history"}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      ประวัติการสั่งซื้อ
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-sm text-red-600"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                      : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium"
                  }
                  to={"/register"}
                >
                  สมัครสมาชิก
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    isActive
                       ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                       : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium"
                  }
                  to={"/login"}
                >
                  เข้าสู่ระบบ
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex md:hidden items-center gap-3">
            {/* Cart Icon for Mobile */}
            <Link to="/cart" className="relative">
              <ShoppingCart size={24} className="text-gray-700" />
              {carts.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 rounded-full px-1.5 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center">
                  {carts.length}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <NavLink
              to={"/"}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 block px-4 py-2 rounded-md text-sm font-medium"
                  : "block px-4 py-2 hover:bg-gray-100 rounded-md text-sm font-medium"
              }
            >
              หน้าหลัก
            </NavLink>

            <NavLink
              to={"/shop"}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-200 block px-4 py-2 rounded-md text-sm font-medium"
                  : "block px-4 py-2 hover:bg-gray-100 rounded-md text-sm font-medium"
              }
            >
              รายการสินค้า
            </NavLink>

            {user ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2">
                    {user.picture ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        src={user.picture}
                        alt="Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
                          e.target.src = `https://ui-avatars.com/api/?name=${initial}&background=3b82f6&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                    )}
                    <span className="font-medium text-sm">{user.name || user.email}</span>
                  </div>
                </div>

                <Link
                  to={"/user/profile"}
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 hover:bg-gray-100 rounded-md text-sm"
                >
                  โปรไฟล์
                </Link>

                <Link
                  to={"/user/history"}
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 hover:bg-gray-100 rounded-md text-sm"
                >
                  ประวัติการสั่งซื้อ
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md text-sm text-red-600"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="space-y-2 border-t border-gray-200 pt-2">
                <NavLink
                  to={"/register"}
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 hover:bg-gray-100 rounded-md text-sm font-medium"
                >
                  สมัครสมาชิก
                </NavLink>

                <NavLink
                  to={"/login"}
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium text-center mx-4"
                >
                  เข้าสู่ระบบ
                </NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default MainNav;
