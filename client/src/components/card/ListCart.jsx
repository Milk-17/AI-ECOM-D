import React, { useState } from "react";
import { List, Loader, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { Link, useNavigate } from "react-router-dom";
import { createUserCart } from "../../api/user";
import { toast } from "react-toastify";

const ListCart = () => {
  const cart = useEcomStore((state) => state.carts);
  const user = useEcomStore((s) => s.user);
  const token = useEcomStore((s) => s.token);
  const getTotalPrice = useEcomStore((state) => state.getTotalPrice);
  const actionUpdateQuantity = useEcomStore((state) => state.actionUpdateQuantity);
  const actionRemoveProduct = useEcomStore((state) => state.actionRemoveProduct);
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveCart = async () => {
    if (cart.length === 0) {
        toast.warning("กรุณาเลือกสินค้าลงตะกร้า");
        return;
    }

    setIsLoading(true);
    try {
      await createUserCart(token, { cart });
      toast.success("บันทึกใส่ตะกร้าเรียบร้อยแล้ว", {
        position: "top-center",
      });
      navigate("/checkout");
    } catch (err) {
      console.log(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกตะกร้า");
    } finally {
      setIsLoading(false);
    }
  };

  // จัดการเพิ่มจำนวน
  const handleIncrement = (product) => {
    const newQuantity = product.count + 1;
    if (newQuantity <= product.quantity) {
      actionUpdateQuantity(product.id, newQuantity);
    } else {
      toast.warning(`มีสินค้าเหลือเพียง ${product.quantity} ชิ้น`);
    }
  };

  // จัดการลดจำนวน
  const handleDecrement = (product) => {
    if (product.count > 1) {
      actionUpdateQuantity(product.id, product.count - 1);
    }
  };

  // จัดการลบสินค้า
  const handleRemove = async (productId, productTitle) => {
    if (window.confirm(`ต้องการลบ "${productTitle}" ออกจากตะกร้า?`)) {
      // คำนวณ cart ใหม่ก่อน (จาก cart ปัจจุบัน)
      const updatedCart = cart.filter((item) => item.id !== productId);
      
      // ลบใน frontend (Zustand)
      actionRemoveProduct(productId);
      
      // sync กับ backend เฉพาะกรณีที่ user login แล้ว
      if (user && token) {
        try {
          await createUserCart(token, { cart: updatedCart });
        } catch (err) {
          console.log("Failed to update cart in backend:", err);
        }
      }
      
      toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
    }
  };

  // ฟังก์ชันจัดรูปแบบตัวเลข
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 items-center bg-white p-4 rounded-lg shadow-sm">
        <ShoppingCart size={28} className="text-blue-600 sm:w-8 sm:h-8" />
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-gray-800">ตะกร้าสินค้า</h1>
          <p className="text-sm text-gray-500">{cart.length} รายการ</p>
        </div>
      </div>

      {cart.length === 0 ? (
        // Empty Cart State
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
          <p className="text-gray-500 mb-6">เริ่มเลือกสินค้าที่คุณชื่นชอบกันเลย!</p>
          <Link to="/shop">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              เลือกสินค้า
            </button>
          </Link>
        </div>
      ) : (
        // Cart with Items
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left: Product List */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  
                  {/* Product Image */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    {item.images && item.images.length > 0 ? (
                      <img
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shadow-sm object-cover"
                        src={item.images[0].url}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        ราคา: ฿{formatNumber(item.price)} / ชิ้น
                      </p>
                      
                      {/* Stock Warning */}
                      {item.quantity < 10 && (
                        <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block mb-2">
                          เหลือเพียง {item.quantity} ชิ้น
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">จำนวน:</span>
                        <button
                          onClick={() => handleDecrement(item)}
                          disabled={item.count <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded-lg transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <input
                          type="number"
                          value={item.count}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            if (val <= item.quantity) {
                              actionUpdateQuantity(item.id, val);
                            } else {
                              toast.warning(`มีสินค้าเหลือเพียง ${item.quantity} ชิ้น`);
                            }
                          }}
                          className="w-16 text-center border border-gray-300 rounded-lg py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max={item.quantity}
                        />
                        
                        <button
                          onClick={() => handleIncrement(item)}
                          disabled={item.count >= item.quantity}
                          className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">ราคารวม</p>
                          <p className="font-bold text-blue-600 text-lg sm:text-xl">
                            ฿{formatNumber(item.price * item.count)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemove(item.id, item.title)}
                          className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="ลบสินค้า"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md border border-gray-100 space-y-4 sm:space-y-6 lg:sticky lg:top-4">
              <h2 className="font-bold text-xl sm:text-2xl text-gray-800 border-b pb-3 sm:pb-4">
                สรุปคำสั่งซื้อ
              </h2>
              
              {/* Summary Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>จำนวนสินค้า</span>
                  <span className="font-medium">{cart.reduce((sum, item) => sum + item.count, 0)} ชิ้น</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>ราคาสินค้า</span>
                  <span className="font-medium">฿{formatNumber(getTotalPrice())}</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-gray-800">ยอดรวมสุทธิ</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                    ฿{formatNumber(getTotalPrice())}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                {user ? (
                  <button
                    disabled={isLoading || cart.length === 0}
                    onClick={handleSaveCart}
                    className={`w-full rounded-lg text-white py-3 sm:py-3.5 font-bold shadow-md flex justify-center items-center gap-2 transition-all text-sm sm:text-base ${
                        isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                    }`}
                  >
                    {isLoading && <Loader className="animate-spin" size={20} />}
                    ดำเนินการสั่งซื้อ
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="bg-blue-600 w-full rounded-lg text-white py-3 sm:py-3.5 font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all text-sm sm:text-base">
                      เข้าสู่ระบบเพื่อสั่งซื้อ
                    </button>
                  </Link>
                )}

                <Link to="/shop">
                  <button className="bg-white border-2 border-gray-300 w-full rounded-lg text-gray-700 py-3 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all text-sm sm:text-base">
                    เลือกสินค้าเพิ่มเติม
                  </button>
                </Link>
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCart;