import React from "react";
import { ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { numberFormat } from '../../utils/number';

const ProductCard = ({ item, showTitle = true, }) => {
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      // 1. สำคัญมาก: สั่งให้ตัวการ์ดยืดความสูงให้เต็มช่อง Grid
      className="h-full"
    >
      {/* 2. Card Container: 
          - h-full: ยืดความสูงตามแม่
          - flex flex-col: จัดเรียงแนวตั้ง
          - justify-between: ดันส่วนบนกับส่วนล่างให้ห่างกันสุดขอบ 
      */}
      <div className="border rounded-md shadow-md p-2 w-full h-full flex flex-col justify-between bg-white hover:shadow-lg transition-shadow duration-300">
        
        {/* --- ส่วนเนื้อหาด้านบน (รูป + ข้อความ) --- */}
        <div className="flex flex-col gap-2">
            
            {/* รูปภาพ: ล็อคความสูง (h-48) เพื่อให้รูปเท่ากันทุกใบ */}
            <div className="w-full h-48 overflow-hidden rounded-md relative bg-gray-200"> 
                {item.images && item.images.length > 0 ? (
                    <Link to={`/product/${item.id}`} className="w-full h-full block">
                        <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                    </Link>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}
            </div>

            {/* ชื่อและรายละเอียด */}
            <div className="py-2">
                {showTitle && (
                    <Link to={`/product/${item.id}`}>
                        {/* line-clamp-2: ตัดคำให้เหลือ 2 บรรทัด ถ้าชื่อยาวเกินไป จะได้ไม่ดันกล่องจนเบี้ยวมาก */}
                        <h2 className="text-lg font-bold line-clamp-2 hover:text-blue-600 cursor-pointer min-h-[3.5rem]">
                            {item.title}
                        </h2>
                    </Link>
                )}
              
            </div>
        </div>

        {/* --- ส่วนด้านล่าง (ราคา + ปุ่ม) --- */}
        {/* ส่วนนี้จะถูกดันลงมาติดขอบล่างสุดเสมอ เพราะเราใช้ justify-between ที่ div หลัก */}
        <div className="mt-2 flex justify-between items-center border-t pt-3">
          <span className="text-lg font-bold text-blue-600">
            {numberFormat(item.price)}
          </span>
          
          <button
            disabled={item.quantity < 1}
            onClick={() => actionAddtoCart(item)}
            className={`p-2 rounded-md shadow-md transition-all ${
                item.quantity < 1 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-800 text-white"
            }`}
          >
            {item.quantity < 1 ? (
                <span className="text-xs font-bold px-2">หมด</span>
            ) : (
                <ShoppingCart size={20} />
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;