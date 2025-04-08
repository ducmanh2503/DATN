import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

import "./banner.css";
import { Image } from "antd";

const Banner = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overlayWidth, setOverlayWidth] = useState(0);

    const spaceBetween = 90; // Khớp với giá trị truyền vào Swiper

    const calcOverlayWidth = () => {
        const wrapper = containerRef.current?.querySelector(".swiper-wrapper");
        const activeSlide = containerRef.current?.querySelector(
            ".swiper-slide-active"
        );

        if (wrapper && activeSlide) {
            const wrapperRect = wrapper.getBoundingClientRect();
            const slideRect = activeSlide.getBoundingClientRect();

            const side =
                (wrapperRect.width - slideRect.width) / 2 - spaceBetween;
            setOverlayWidth(Math.max(side, 0));
        }
    };

    useEffect(() => {
        // Tính lần đầu
        calcOverlayWidth();

        // Tính lại khi resize
        window.addEventListener("resize", calcOverlayWidth);

        // Tính lại sau mỗi lần swiper thay đổi slide
        const interval = setInterval(calcOverlayWidth, 500); // Hoặc dùng observer/Swiper event

        return () => {
            window.removeEventListener("resize", calcOverlayWidth);
            clearInterval(interval);
        };
    }, []);

    return (
        <div
            className="banner-box"
            ref={containerRef}
            style={{ position: "relative" }}
        >
            <div
                className="slide-overlay left"
                style={{ width: `${overlayWidth}px` }}
            />
            <div
                className="slide-overlay right"
                style={{ width: `${overlayWidth}px` }}
            />
            <Swiper
                slidesPerView="auto"
                spaceBetween={90}
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
            >
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
                <SwiperSlide className="custom-slide">
                    <img
                        src="https://cdn.galaxycine.vn/media/2025/4/1/the-red-envelope-1_1743492961706.jpg"
                        alt=""
                    />
                </SwiperSlide>
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
