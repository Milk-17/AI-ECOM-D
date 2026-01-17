import React from "react";
import ContentCarousel from "../components/Home/ContentCarousel";
import BestSeller from "../components/Home/BestSeller";
import NewProduct from "../components/Home/NewProduct";
import { Flame, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white py-12 px-6 mb-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            ยินดีต้อนรับสู่ CPE Shop
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
            ให้เราแนะนำคอมพิวเตอร์ตามราคาที่คุณต้องการ พร้อมพบกับประสบการณ์ช้อปปิ้งที่ง่ายและรวดเร็ว
          </p>
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <ContentCarousel />
      </div>

      {/* Best Seller Section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Flame className="text-gray-600" size={32} />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            สินค้าขายดี
          </h2>
          <Flame className="text-gray-600" size={32} />
        </div>
        <BestSeller />
      </section>

      {/* New Product Section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Sparkles className="text-gray-600" size={32} />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            สินค้าใหม่
          </h2>
          <Sparkles className="text-gray-600" size={32} />
        </div>
        <NewProduct />
      </section>

      {/* Footer Banner - พื้นที่ว่าง */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-10 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          {/* เว้นไว้สำหรับเพิ่มเนื้อหาในอนาคต */}
        </div>
      </div>
    </div>
  );
};

export default Home;