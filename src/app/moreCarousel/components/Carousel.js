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
        style={{ maxWidth: "1856px"}}
        className="MoreCarouselWrapper"
      >
        <Swiper
          modules={[Virtual, Navigation, Pagination]}
          onSwiper={setSwiperRef}
          slidesPerView={3}
          centeredSlides={false}
          spaceBetween={30}
          loop={true}
          navigation={true}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={card.id} virtualIndex={index} className={styles.swaper}>
              <div
                className={`${styles.cardContainer1}
                  ${styles.card}
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

         {/* Navigation Buttons */}
         <div className={styles.btnContainerWrapper}>

    
         <div className={styles.btnContainer}>
          <div
            className={styles.btn}
            onClick={() => swiperRef?.slidePrev()}
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.12184 0.128139C5.2927 0.298992 5.2927 0.576005 5.12184 0.746858L1.49372 4.375H10.9375C11.1791 4.375 11.375 4.57088 11.375 4.8125C11.375 5.05411 11.1791 5.25 10.9375 5.25H1.49372L5.12184 8.87816C5.2927 9.04902 5.2927 9.32598 5.12184 9.49684C4.95098 9.6677 4.67402 9.6677 4.50314 9.49684L0.128139 5.12184C-0.0427131 4.95098 -0.0427131 4.67402 0.128139 4.50316L4.50314 0.128139C4.67402 -0.0427131 4.95098 -0.0427131 5.12184 0.128139Z" fill="white"/>
</svg>
          </div>

          <div
            className={styles.btn}
            onClick={() => swiperRef?.slideNext()}
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.56566 2.31564C7.3948 2.48649 7.3948 2.76351 7.56566 2.93436L11.1938 6.5625H1.75C1.50838 6.5625 1.3125 6.75838 1.3125 7C1.3125 7.24161 1.50838 7.4375 1.75 7.4375H11.1938L7.56566 11.0657C7.3948 11.2365 7.3948 11.5135 7.56566 11.6843C7.73652 11.8552 8.01348 11.8552 8.18436 11.6843L12.5594 7.30934C12.7302 7.13848 12.7302 6.86152 12.5594 6.69066L8.18436 2.31564C8.01348 2.14479 7.73652 2.14479 7.56566 2.31564Z" fill="white"/>
</svg>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
