// ProductDetailCard.jsx
import React, { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, Package, CheckCircle, AlertCircle } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { getProductById, listProduct } from "../../api/product";
import useEcomStore from "../../store/ecom-store";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { numberFormat } from "../../utils/number";

const ProductDetailCard = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1); // เพิ่ม state สำหรับจำนวน
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);
  const carts = useEcomStore((state) => state.carts);

  // โหลดข้อมูลสินค้า
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
        setQuantity(1); // Reset จำนวนเมื่อเปลี่ยนสินค้า
      } catch (err) {
        console.error(err);
        toast.error("ไม่สามารถโหลดสินค้าได้");
      }
    };
    fetchProduct();
  }, [id]);

  // โหลดสินค้าอื่นมาแนะนำ
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await listProduct(6);
        setRelatedProducts(res.data.filter((p) => p._id !== id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [id]);

  // ฟังก์ชันจัดการจำนวน
  const handleIncrement = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    } else {
      toast.warning(`มีสินค้าเหลือเพียง ${product.quantity} ชิ้น`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    if (val <= product.quantity) {
      setQuantity(Math.max(1, val));
    } else {
      toast.warning(`มีสินค้าเหลือเพียง ${product.quantity} ชิ้น`);
      setQuantity(product.quantity);
    }
  };

  // ฟังก์ชันเพิ่มลงตะกร้า
  const handleAddToCart = () => {
    // เพิ่มสินค้าตามจำนวนที่เลือก
    for (let i = 0; i < quantity; i++) {
      actionAddtoCart(product);
    }
    toast.success(`เพิ่ม ${product.title} (${quantity} ชิ้น) ลงตะกร้าแล้ว!`);
    setQuantity(1); // Reset จำนวน
  };

  // คำนวณจำนวนที่มีในตะกร้าแล้ว
  const cartItem = carts.find((item) => item.id === product?.id);
  const inCartQuantity = cartItem ? cartItem.count : 0;

  if (!product) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto my-4 md:my-10 p-3 sm:p-4">
      {/* Main Section */}
      <motion.div
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left: รูปสินค้า */}
        <div className="md:w-1/2 flex flex-col items-center justify-center gap-4">
          {product.images && product.images.length > 0 ? (
            <Swiper
              navigation={true}
              modules={[Navigation]}
              className="w-full h-56 md:h-80 lg:h-96 rounded-lg"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img.url}
                    alt={`product-${index}`}
                    className="w-full h-56 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-56 md:h-80 bg-gray-200 flex items-center justify-center rounded-lg">
              <Package size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Right: ข้อมูลสินค้า */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-gray-800">
              {product.title}
            </h1>
           
            {/* ราคา */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">ราคาต่อชิ้น</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {numberFormat(product.price)}
              </p>
              {quantity > 1 && (
                <p className="text-sm text-gray-600 mt-2">
                  ราคารวม: <span className="font-bold text-green-700">฿{numberFormat(product.price * quantity)}</span>
                </p>
              )}
            </div>

            {/* สถานะสต็อก */}
            <div className="mb-4">
              {product.quantity > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-gray-700">
                    พร้อมส่ง - คงเหลือ <span className="font-bold">{product.quantity}</span> ชิ้น
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle size={18} className="text-red-600" />
                  <span className="text-red-600 font-semibold">สินค้าหมด</span>
                </div>
              )}
              
              {product.quantity < 10 && product.quantity > 0 && (
                <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded inline-block">
                  เหลือน้อย! รีบสั่งซื้อเลย
                </p>
              )}

              {inCartQuantity > 0 && (
                <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
                  มีในตะกร้าแล้ว {inCartQuantity} ชิ้น
                </p>
              )}
            </div>
          </div>

          {/* ควบคุมจำนวนและปุ่มเพิ่มลงตะกร้า */}
          <div className="mt-4 space-y-4">
            {/* ส่วนเลือกจำนวน */}
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                จำนวน
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || product.quantity < 1}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded-lg transition-colors font-bold text-lg"
                >
                  <Minus size={20} />
                </button>
                
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={product.quantity < 1}
                  className="w-20 text-center border-2 border-gray-300 rounded-lg py-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  min="1"
                  max={product.quantity}
                />
                
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.quantity || product.quantity < 1}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-bold text-lg"
                >
                  <Plus size={20} />
                </button>

                <span className="text-sm text-gray-500 ml-2">
                  (สูงสุด {product.quantity} ชิ้น)
                </span>
              </div>
            </div>

            {/* ปุ่มเพิ่มลงตะกร้า */}
            <button
              onClick={handleAddToCart}
              disabled={product.quantity < 1}
              className={`flex items-center justify-center gap-3 w-full px-6 py-3 sm:py-4 rounded-lg shadow-md font-bold text-base sm:text-lg transition-all duration-300 ${
                product.quantity < 1
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg transform hover:scale-[1.02]"
              }`}
            >
              <ShoppingCart size={24} />
              {product.quantity < 1 ? "สินค้าหมด" : `เพิ่ม ${quantity} ชิ้น ลงตะกร้า`}
            </button>

          </div>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
        <div className="flex gap-2 sm:gap-4 mb-4 border-b overflow-x-auto">
          <button
            className={`px-3 sm:px-4 py-2 font-semibold whitespace-nowrap transition-colors text-sm sm:text-base ${
              activeTab === "details" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("details")}
          >
            รายละเอียดสินค้า
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "details" && (
            <div>
              {typeof product.description === "object" && 
               product.description !== null &&
               Object.keys(product.description).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm sm:text-base">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-300">
                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-gray-800 w-1/3">
                          คุณสมบัติ
                        </th>
                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-gray-800">
                          รายละเอียด
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(product.description).map(
                        ([key, value], index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0
                                ? "bg-white border border-gray-300 hover:bg-gray-50"
                                : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                            }
                          >
                            <td className="border border-gray-300 p-2 sm:p-3 font-semibold text-gray-700">
                              {key}
                            </td>
                            <td className="border border-gray-300 p-2 sm:p-3 text-gray-700">
                              {value}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="italic">ไม่มีข้อมูลรายละเอียด</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailCard;