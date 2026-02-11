import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
//import "swiper/css/navigation";

// import required modules
import { Pagination, Autoplay, Navigation } from "swiper/modules";

const ContentCarousel = () => {
  // ข้อมูลรูปภาพ
  const data = [
    { id: 1, download_url: "/amd.jpg" },
    { id: 2, download_url: "/Apple.jpg" },
    { id: 3, download_url: "/asus-logo.png" },
    { id: 4, download_url: "/intel-logo.png" },
    { id: 6, download_url: "/Nvidia-Symbol.jpg" },
    { id: 7, download_url: "/ROG logo_red.png" },
    { id: 8, download_url: "/ThinkPad-Logo.wine.png" },
  ];

  return (
    <div>
      <Swiper
        slidesPerView={5}
        spaceBetween={10}
        pagination={true}
        //navigation={true}
        modules={[Pagination, Autoplay, Navigation]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        // ----------- แก้ไขจุดที่ 1: กำหนดความสูงที่แน่นอนให้ Container -----------
        // ผมเพิ่ม h-32 (ความสูงประมาณ 128px) คุณสามารถเปลี่ยนเป็น h-40, h-48 ได้ตามต้องการ
        // และลบ object-cover ออกจากตรงนี้ เพราะควรไปอยู่ที่ tag img
        className="mySwiper h-32 rounded-md mb-4"
      >
        {data.map((item, i) => (
          // ----------- แก้ไขจุดที่ 2: บังคับให้ Slide สูงเต็มพื้นที่ Container -----------
          <SwiperSlide key={i} className="h-full">
            <img
              className="rounded-md w-full h-full object-contain bg-white" 
              src={item.download_url}
              alt={`Brand ${i + 1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
              alt="banner"
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ContentCarousel;