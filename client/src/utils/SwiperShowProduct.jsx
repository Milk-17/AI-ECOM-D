import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { Pagination, Autoplay, Navigation } from "swiper/modules";

const SwiperShowProduct = ({ children }) => {
  return (
    <Swiper
      slidesPerView={5}
      spaceBetween={16}
      pagination={true}
      navigation={true}
      modules={[Pagination, Autoplay, Navigation]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      breakpoints={{
        320: {
          slidesPerView: 2,
          spaceBetween: 12,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 12,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 16,
        },
        1280: {
          slidesPerView: 5,
          spaceBetween: 16,
        },
      }}
      className="mySwiper object-cover rounded-md"
    >
      {children}
    </Swiper>
  );
};

export default SwiperShowProduct;