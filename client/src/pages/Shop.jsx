import React, { useEffect, useState } from "react";
import ProductCard from "../components/card/ProductCard";
import useEcomStore from "../store/ecom-store";
import SearchCart from "../components/card/SearchCart";
import CartCard from "../components/card/CartCard";
import { Filter, ShoppingCart, X } from "lucide-react";

const Shop = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div className="relative">
      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-4 p-5">
        {/* Sidebar Search - เล็กลง */}
        <aside className="w-[280px] bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-lg border border-gray-200 sticky top-3 h-fit">
          <SearchCart />
        </aside>

        {/* Product Grid - กว้างขึ้น แสดง 4-5 คอลัมน์ */}
        <main className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((item, index) => (
            <ProductCard key={index} item={item} />
          ))}
        </main>

        {/* Cart Sidebar - เล็กลง */}
        <aside className="w-[320px] bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-lg border border-gray-200 sticky top-3 h-fit">
          <CartCard />
        </aside>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden p-4">
        {/* Product Grid for Mobile */}
        <div className="grid grid-cols-2 gap-3 mb-20">
          {products.map((item, index) => (
            <ProductCard key={index} item={item} />
          ))}
        </div>

        {/* Floating Buttons */}
        <div className="fixed bottom-4 right-4 flex gap-3 z-40">
          <button
            onClick={() => setShowSearch(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Filter size={24} />
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-all active:scale-95"
          >
            <ShoppingCart size={24} />
          </button>
        </div>

        {/* Mobile Search Drawer */}
        {showSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowSearch(false)}>
            <div 
              className="fixed left-0 top-0 bottom-0 w-[85%] bg-white p-6 overflow-y-auto transform transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">ค้นหา & กรอง</h2>
                <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <SearchCart />
            </div>
          </div>
        )}

        {/* Mobile Cart Drawer */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
            <div 
              className="fixed right-0 top-0 bottom-0 w-[85%] bg-white p-6 overflow-y-auto transform transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">ตะกร้าสินค้า</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <CartCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;