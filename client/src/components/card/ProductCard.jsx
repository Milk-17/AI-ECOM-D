import React from "react";
import { ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { numberFormat } from '../../utils/number';

const ProductCard = ({ item, showTitle = true }) => {
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);

  //  สร้าง Slug อัตโนมัติจากชื่อสินค้า
  // เช่น "Mouse Logitech G-Pro" -> "mouse-logitech-g-pro"
  const productSlug = item.title
    .toLowerCase()
    .replace(/\s+/g, '-')                 // เปลี่ยนช่องว่าง เป็นขีด -
    .replace(/[^\w\u0E00-\u0E7F-]+/g, '') // อนุญาตแค่ ภาษาไทย, อังกฤษ, ตัวเลข, ขีด (ลบอักขระพิเศษออก)
    .replace(/\-\-+/g, '-')               // ลบขีดที่ซ้ำกัน (เช่น -- ให้เหลือ -)
    .replace(/^-+/, '')                   // ลบขีดตัวหน้าสุด (ถ้ามี)
    .replace(/-+$/, '');                  // ลบขีดตัวท้ายสุด (ถ้ามี)

  //  สร้าง Link รูปแบบ: /product/{ID}-{Slug}
  // เช่น /product/15-gaming-mouse-logitech
  const linkPath = `/product/${item.id}-${productSlug}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="h-[300px]"
    >
      <div className="border rounded-md shadow-md p-2 w-full h-full flex flex-col bg-white hover:shadow-lg transition-shadow duration-300">
        
        {/* --- ส่วนเนื้อหาด้านบน (รูป + ข้อความ) --- */}
        <div className="flex flex-col gap-1">
            
            {/* รูปภาพ */}
            <div className="w-full h-28 overflow-hidden rounded-md relative bg-gray-200"> 
                {item.images && item.images.length > 0 ? (
                    <Link to={linkPath} className="w-full h-full block">
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

            {/* ชื่อสินค้า */}
            <div className="py-0.5">
                {showTitle && (
                    <Link to={linkPath}>
                        <h2 className="text-xs font-semibold line-clamp-2 hover:text-blue-600 cursor-pointer h-8 overflow-hidden" title={item.title}>
                            {item.title}
                        </h2>
                    </Link>
                )}
            </div>
        </div>

        {/* --- ส่วนด้านล่าง (ราคา + ปุ่ม) --- */}
        <div className="mt-auto pt-1.5 flex justify-between items-center border-t">
          <span className="text-sm font-bold text-blue-600">
            {numberFormat(item.price)}
          </span>
          
          <button
            disabled={item.quantity < 1}
            onClick={() => actionAddtoCart(item)}
            className={`p-1.5 rounded-md shadow-md transition-all ${
                item.quantity < 1 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-800 text-white"
            }`}
          >
            {item.quantity < 1 ? (
                <span className="text-xs font-bold px-1.5">หมด</span>
            ) : (
                <ShoppingCart size={16} />
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;