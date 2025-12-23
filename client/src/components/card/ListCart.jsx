import React, { useState } from "react"; // 1. เพิ่ม useState
import { List, Loader } from "lucide-react"; // เพิ่ม icon Loader
import useEcomStore from "../../store/ecom-store"; // แก้คำผิด Stroe -> Store
import { Link, useNavigate } from "react-router-dom";
import { createUserCart } from "../../api/user";
import { toast } from "react-toastify";

const ListCart = () => {
  const cart = useEcomStore((state) => state.carts);
  const user = useEcomStore((s) => s.user);
  const token = useEcomStore((s) => s.token);
  const getTotalPrice = useEcomStore((state) => state.getTotalPrice);
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // 2. State สำหรับล็อกปุ่ม

  const handleSaveCart = async () => {
    // ป้องกันการกดสั่งซื้อถ้าตะกร้าว่าง
    if (cart.length === 0) {
        toast.warning("กรุณาเลือกสินค้าลงตะกร้า");
        return;
    }

    setIsLoading(true); // เริ่มโหลด ล็อกปุ่ม
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
      setIsLoading(false); // จบการโหลด ปลดล็อกปุ่ม
    }
  };

  // ฟังก์ชันจัดรูปแบบตัวเลข (ใส่ลูกน้ำ)
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-gray-50 rounded-t-md p-4">
      {/* Header */}
      <div className="flex gap-4 mb-4 items-center">
        <List size={30} className="text-gray-700" />
        <p className="font-bold text-2xl text-gray-800">รายการสินค้า ({cart.length})</p>
      </div>

      {/* List Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Product List */}
        <div className="col-span-2 space-y-4">
          {cart.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center">
                
                {/* Row Left: Image & Info */}
                <div className="flex gap-4 items-center">
                  {item.images && item.images.length > 0 ? (
                    <img
                      className="w-20 h-20 rounded-lg shadow-sm object-cover"
                      src={item.images[0].url}
                      alt={item.title}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex text-center items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-lg text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(item.price)} x {item.count} ชิ้น
                    </p>
                  </div>
                </div>

                {/* Row Right: Total per item */}
                <div className="text-right">
                  <div className="font-bold text-blue-600 text-lg">
                  ฿{formatNumber(item.price * item.count)} 
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Total & Action */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit space-y-6 sticky top-4">
          <p className="font-bold text-2xl text-gray-800 border-b pb-4">สรุปคำสั่งซื้อ</p>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-lg">ยอดรวมสุทธิ</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatNumber(getTotalPrice())} <span className="text-sm text-gray-500 font-normal">บาท</span>
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              // 3. เอา Link ออกจากปุ่ม เพราะเราใช้ onClick navigate แล้ว
              <button
                disabled={isLoading || cart.length === 0} // ปิดปุ่มถ้าโหลดอยู่ หรือ ตะกร้าว่าง
                onClick={handleSaveCart}
                className={`w-full rounded-lg text-white py-3 shadow-md flex justify-center items-center gap-2 transition-all ${
                    isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                }`}
              >
                {isLoading && <Loader className="animate-spin" size={20} />}
                สั่งซื้อสินค้า
              </button>
            ) : (
              <Link to={"/login"}>
                <button className="bg-blue-600 w-full rounded-lg text-white py-3 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all">
                  เข้าสู่ระบบเพื่อสั่งซื้อ
                </button>
              </Link>
            )}

            <Link to={"/shop"}>
              <button className="bg-white border border-gray-300 w-full rounded-lg text-gray-700 py-3 shadow-sm hover:bg-gray-50 transition-all">
                เลือกสินค้าเพิ่มเติม
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCart;