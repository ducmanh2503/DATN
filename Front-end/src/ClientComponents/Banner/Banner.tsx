import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import axios from "axios";

import "./banner.css";
import { Image } from "antd";

interface SliderItem {
  id: number;
  title: string;
  image_path: string;
  is_active: boolean;
}

const Banner = () => {
  const [sliders, setSliders] = useState<SliderItem[]>([]);

  useEffect(() => {
    // Lấy dữ liệu slider từ API
    const fetchSliders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/active-sliders"
        );
        if (response.data && response.data.data) {
          setSliders(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải slider:", error);
      }
    };

    fetchSliders();
  }, []);

  // Render ảnh slide từ API hoặc fallback về text mặc định
  const renderSlide = (index: number) => {
    if (sliders.length > index) {
      const slider = sliders[index];
      return (
        <img
          src={`http://localhost:8000/storage/${slider.image_path}`}
          alt={slider.title}
          width="100%"
          height="100%"
        />
      );
    }
    return `Slide ${index + 1}`;
  };

  return (
    <div className="banner-box">
      <Swiper
        slidesPerView="auto"
        spaceBetween={200}
        loop={true}
        navigation={true}
        centeredSlides={true}
        speed={1000}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Navigation, Pagination]}
        breakpoints={{
          640: {
            spaceBetween: 0, // Ẩn khoảng cách khi màn hình nhỏ
          },
          1024: {
            spaceBetween: 200, // Hiển thị khoảng cách lớn hơn khi màn hình đủ rộng
          },
        }}
      >
        <SwiperSlide className="custom-slide">{renderSlide(0)}</SwiperSlide>
        <SwiperSlide className="custom-slide">{renderSlide(1)}</SwiperSlide>
        <SwiperSlide className="custom-slide">{renderSlide(2)}</SwiperSlide>
        <SwiperSlide className="custom-slide">{renderSlide(3)}</SwiperSlide>
        <SwiperSlide className="custom-slide">{renderSlide(4)}</SwiperSlide>
        <SwiperSlide className="custom-slide">{renderSlide(5)}</SwiperSlide>
        <SwiperSlide className="custom-slide">{renderSlide(6)}</SwiperSlide>
      </Swiper>
      <div className="promotion">
        <div className="promotion-1">
          <Image className="promotion-image"></Image>
        </div>
        <div className="promotion-2">
          <Image className="promotion-image"></Image>
        </div>
      </div>
    </div>
  );
};

export default Banner;
