"use client";
import React, { useRef, useState } from 'react';
import { Virtual, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import InnerCarousel from './InnerCarousel';
import styles from './ExpCarousel.module.css';

export default function ExpCarousel() {
  const [swiperRef, setSwiperRef] = useState(null);
  // Create array with 10 slides
  const [slides] = useState(
    Array.from({ length: 10 }).map((_, index) => `Slide ${index + 1}`)
  );

  const slideTo = (index) => {
    swiperRef.slideTo(index - 1, 0);
  };

  return (
    <>
    <div style={{maxWidth:"1520px", margin:"0 auto"}} className='ExpCarouselWrapper'>
    <Swiper
        modules={[Virtual, Navigation, Pagination]}
        onSwiper={setSwiperRef}
        slidesPerView={4}
        centeredSlides={false}
        spaceBetween={30}
        pagination={{
          type: 'fraction',
        }}
        navigation={true}
        virtual
      >
        {slides.map((slideContent, index) => (
          <SwiperSlide key={slideContent} virtualIndex={index}>
            <div style={{ margin:"100px auto"}}>
              <InnerCarousel />
              <div className={styles.innerCarouselContent}>
            <p className={styles.innerCarouselContentTitle}>Munnar, Kerala</p>
            <div className={styles.innerCarouselContentSubtitle}>Tranquil Retreat Lodge</div>
            <div className={styles.innerCarouselContentPrice}>
                <div className={styles.innerCarouselContentPriceValue}>
                  FROM <span className={styles.innerCarouselContentPriceValuePrice}>₹449/night</span>
                  </div>
                <div className={styles.innerCarouselContentPriceRating}>3.4</div>
            </div>
          </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
     

     
    </>
  );
}
