import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

import "./banner.css";
import { Image } from "antd";

const Banner = () => {
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
                <SwiperSlide className="custom-slide">Slide 1</SwiperSlide>
                <SwiperSlide className="custom-slide">Slide 2</SwiperSlide>
                <SwiperSlide className="custom-slide">Slide 3</SwiperSlide>
                <SwiperSlide className="custom-slide">Slide 4</SwiperSlide>
                <SwiperSlide className="custom-slide">Slide 5</SwiperSlide>
                <SwiperSlide className="custom-slide">Slide 6</SwiperSlide>
                <SwiperSlide className="custom-slide">Slide 7</SwiperSlide>
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
