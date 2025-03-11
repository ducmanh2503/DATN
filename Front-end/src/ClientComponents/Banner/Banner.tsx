import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { Image } from "antd";
import clsx from "clsx";
import styles from "./banner.module.css";

const Banner = () => {
  return (
    <div className={clsx(styles.bannerBox)}>
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
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 1</SwiperSlide>
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 2</SwiperSlide>
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 3</SwiperSlide>
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 4</SwiperSlide>
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 5</SwiperSlide>
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 6</SwiperSlide>
        <SwiperSlide className={clsx(styles.customSlide)}>Slide 7</SwiperSlide>
      </Swiper>
      <div className={clsx(styles.promotion)}>
        <div className={clsx(styles.promotion1)}>
          <Image className={clsx(styles.promotionImage)}></Image>
        </div>
        <div className={clsx(styles.promotion2)}>
          <Image className={clsx(styles.promotionImage)}></Image>
        </div>
      </div>
    </div>
  );
};

export default Banner;
