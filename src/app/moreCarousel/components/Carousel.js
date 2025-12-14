"use client";
import React, { useRef, useState } from "react";
import { Virtual, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import InnerCarousel from "../../exploreCarousel/component/InnerCarousel";
import styles from "./Carousel.module.css";

export default function Carousel({ cards = [] }) {
  const [swiperRef, setSwiperRef] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Create array with 10 slides
  const [slides] = useState(
    Array.from({ length: 10 }).map((_, index) => `Slide ${index + 1}`)
  );

  const slideTo = (index) => {
    swiperRef.slideTo(index - 1, 0);
  };

  return (
    <>
      <div
        style={{ maxWidth: "1856px", margin: "0 32px" }}
        className="ExpCarouselWrapper"
      >
        <Swiper
          modules={[Virtual, Navigation, Pagination]}
          onSwiper={setSwiperRef}
          slidesPerView={3}
          centeredSlides={false}
          spaceBetween={30}
          pagination={{
            type: "fraction",
          }}
          navigation={true}
          virtual
        >
          {cards.map((card, index) => (
            <SwiperSlide key={card.id} virtualIndex={index}>
              <div
                className={`${styles.cardContainer1}
      ${hoveredIndex === index ? styles.isHovered : ""}
      ${hoveredIndex !== null && hoveredIndex !== index ? styles.isShrunk : ""}
      ${index === 0 ? styles.leftCard : ""}
      ${index === 1 ? styles.middleCard : ""}
      ${index === 2 ? styles.rightCard : ""}
    `}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img src={card.img} alt={card.title} />

                <div className={styles.cardOverlay}>
                  <span className={styles.duration}>{card.badge}</span>

                  <h3 className={styles.cardTitle}>{card.title}</h3>

                  <p className={styles.cities}>{card.cities}</p>

                  <div className={styles.price}>
                    {card.price}
                    <span>/Adult</span>
                  </div>

                  <button className={styles.arrowBtn}>
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.75 8.75H21.25V21.25"
                        stroke="white"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M8.75 21.25L21.25 8.75"
                        stroke="white"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
