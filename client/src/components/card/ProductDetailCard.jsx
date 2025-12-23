// ProductDetailCard.jsx
import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { getProductById, listProduct } from "../../api/product";
import useEcomStore from "../../store/ecom-store";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { numberFormat } from "../../utils/number"; // <--- 1. เพิ่ม import ตรงนี้

const ProductDetailCard = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("details"); // Tab state
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);

  // โหลดข้อมูลสินค้า
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
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
        const res = await listProduct(6); // ดึงสินค้า 6 ตัว
        setRelatedProducts(res.data.filter((p) => p._id !== id)); // กรองตัวเองออก
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [id]);

  if (!product) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto my-10 p-4">
      {/* Main Section */}
      <motion.div
        className="bg-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row gap-6"
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
              className="w-full h-64 md:h-96 rounded-lg"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img.url}
                    alt={`product-${index}`}
                    className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              No Image
            </div>
          )}
        </div>

        {/* Right: ข้อมูลสินค้า */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
           
            <p className="text-xl font-semibold mb-2">
              {/* <--- 2. แก้ไขตรงนี้ ใส่ numberFormat */}
              ราคา: <span className="text-green-600">{numberFormat(product.price)} บาท</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              คงเหลือ: {product.quantity} ชิ้น
            </p>
          </div>

          {/* ปุ่มเพิ่มลงตะกร้า */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => {
                actionAddtoCart(product);
                toast.success("เพิ่มสินค้าลงตะกร้าแล้ว!");
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md font-semibold transition-all duration-300"
            >
              <ShoppingCart size={20} />
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <div className="mt-6 bg-gray-50 rounded-lg shadow-inner p-4">
        <div className="flex gap-4 mb-4 border-b">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === "details" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("details")}
          >
            รายละเอียด
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "details" && (
            <div>
              {/* ตรวจสอบ description เป็น JSON object หรือไม่ */}
              {typeof product.description === "object" && 
               product.description !== null &&
               Object.keys(product.description).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 border border-gray-300">
                        <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800">
                          คุณสมบัติ
                        </th>
                        <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800">
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
                                ? "bg-white border border-gray-300"
                                : "bg-gray-50 border border-gray-300"
                            }
                          >
                            <td className="border border-gray-300 p-3 font-semibold text-gray-700">
                              {key}
                            </td>
                            <td className="border border-gray-300 p-3 text-gray-700">
                              {value}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">ไม่มีข้อมูลรายละเอียด</p>
              )}
            </div>
          )}
          {activeTab === "spec" && (
            <ul className="list-disc pl-6 text-gray-700">
              {product.specs?.map((spec, i) => (
                <li key={i}>{spec}</li>
              )) || <li>ไม่มีข้อมูลสเปค</li>}
            </ul>
          )}
          {activeTab === "reviews" && (
            <div className="text-gray-700">
              {product.reviews?.length > 0 ? (
                product.reviews.map((r, i) => (
                  <div key={i} className="border-b py-2">
                    <p className="font-semibold">{r.user}</p>
                    <p>{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>ยังไม่มีรีวิว</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailCard;