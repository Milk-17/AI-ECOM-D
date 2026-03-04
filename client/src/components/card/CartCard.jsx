import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, Loader, ArrowRight } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { Link, useNavigate } from "react-router-dom";
import { createUserCart } from "../../api/user";
import { toast } from "react-toastify";
import { numberFormat } from '../../utils/number';

const CartCard = () => {
  const carts = useEcomStore((state) => state.carts);
  const user = useEcomStore((state) => state.user);
  const token = useEcomStore((state) => state.token);
  const actionUpdateQuantity = useEcomStore((state) => state.actionUpdateQuantity);
  const actionRemoveProduct = useEcomStore((state) => state.actionRemoveProduct);
  const getTotalPrice = useEcomStore((state) => state.getTotalPrice);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveCart = async () => {
    if (carts.length === 0) {
      toast.warning("กรุณาเลือกสินค้าลงตะกร้า");
      return;
    }

    setIsLoading(true);
    try {
      await createUserCart(token, { cart: carts });
      // toast.success("กำลังดำเนินการ..."); // Optional: แจ้งเตือนก่อนเปลี่ยนหน้า
      navigate("/checkout");
    } catch (err) {
      console.log(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกตะกร้า");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 FIX: ลบสินค้าพร้อม sync กับ backend
  const handleRemoveProduct = async (productId) => {
    // คำนวณ cart ใหม่ก่อน (จาก carts ปัจจุบัน)
    const updatedCart = carts.filter((item) => item.id !== productId);
    
    // ลบใน frontend (Zustand)
    actionRemoveProduct(productId);
    
    // ถ้า user login แล้ว → sync กับ backend ทันที
    if (user && token) {
      try {
        await createUserCart(token, { cart: updatedCart });
      } catch (err) {
        console.log("Failed to sync cart with backend:", err);
      }
    }
    
    toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold flex gap-3 items-center text-gray-800 mb-6 pb-4 border-b border-gray-200">
        <ShoppingBag className="text-indigo-600" />
        <span>ตะกร้าสินค้า <span className="text-sm font-normal text-gray-500">({carts.length} รายการ)</span></span>
      </h1>

      {carts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">ไม่มีสินค้าในตะกร้า</p>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              {/* Row 1: Image & Info */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 items-start w-full">
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {item.images && item.images.length > 0 ? (
                      <img
                        className="w-full h-full object-cover"
                        src={item.images[0].url}
                        alt={item.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate pr-4">{item.title}</h3>
                    <p className="text-sm text-indigo-600 font-medium mt-1 md:hidden">
                      {numberFormat(item.price)} ฿
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      คงเหลือ: <span className="font-semibold text-gray-700">{item.quantity}</span> ชิ้น
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveProduct(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                  title="ลบสินค้า"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Row 2: Controls & Price (Desktop Layout Optimized) */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-gray-100">
                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => actionUpdateQuantity(item.id, item.count - 1)}
                    className="p-1 rounded-md hover:bg-white hover:shadow-sm text-gray-600 disabled:opacity-30 transition-all"
                    disabled={item.count <= 1}
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-8 text-center font-semibold text-sm text-gray-700">{item.count}</span>

                  <button
                    onClick={() => actionUpdateQuantity(item.id, item.count + 1)}
                    className="p-1 rounded-md hover:bg-white hover:shadow-sm text-gray-600 disabled:opacity-30 transition-all"
                    disabled={item.count >= item.quantity}
                    title={item.count >= item.quantity ? "เกินจำนวนสินค้าที่มี" : "เพิ่มจำนวน"}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Total Price */}
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">รวม</span>
                  <span className="font-bold text-indigo-600 text-lg">
                    {numberFormat(item.price * item.count)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-600 font-medium">ยอดรวมสุทธิ</span>
          <span className="text-2xl font-bold text-gray-900">{numberFormat(getTotalPrice())} <span className="text-base font-normal text-gray-500"></span></span>
        </div>

        {user ? (
          <button
            disabled={isLoading || carts.length === 0}
            onClick={handleSaveCart}
            className={`w-full py-3.5 rounded-xl shadow-lg text-white font-semibold flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] ${isLoading || carts.length === 0
                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
              }`}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={20} /> กำลังดำเนินการ...
              </>
            ) : (
              <>
                ชำระเงิน <ArrowRight size={20} />
              </>
            )}
          </button>
        ) : (
          <Link to="/cart" className="block w-full">
            <button className="w-full bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 rounded-xl transition-colors">
              ตะกร้าสินค้า
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CartCard;