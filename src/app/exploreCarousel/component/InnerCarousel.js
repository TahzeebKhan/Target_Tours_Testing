import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./innerCarousel.module.css";

import { Pagination } from "swiper/modules";

export default function InnerCarousel({ images = [], favorite, onFavorite }) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <>
      <div className="innerCarouselWrapper">
        <Swiper
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-pagination-color": "#fff",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
          lazy={true}
          pagination={{ clickable: true }}
          navigation={false}
          modules={[Pagination]}
          className="mySwiper relative"
        >
          {/* ⭐ Independent Heart Icon */}
          <div className={styles.heartIcon} onClick={onFavorite}>
            <img
              src={
                favorite
                  ? "/icons/heartIconFilled.svg"
                  : "/icons/heartIcon.svg"
              }
              alt=""
            />
          </div>

          <div className={styles.iconsCont}>
            {!isBeginning && (
              <div
                className={styles.leftBtn}
                onClick={() => swiperRef.current.slidePrev()}
              >
                <img src="/icons/left.svg" alt="" />
              </div>
            )}

            {!isEnd && (
              <div
                className={styles.leftRightBtn}
                onClick={() => swiperRef.current.slideNext()}
              >
                <img src="/icons/right.svg" alt="" />
              </div>
            )}
          </div>

          {/* Dynamic Images */}
          {images.map((img, i) => (
            <SwiperSlide key={i} className={styles.swapper}>
              <img src={img} loading="lazy" />
              {/* <div className={styles.overlay}></div> */}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
