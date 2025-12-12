import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from './innerCarousel.module.css';


// import required modules
import { Pagination, Navigation } from 'swiper/modules';

export default function InnerCarousel() {
  return (
    <>
    <div className='innerCarouselWrapper'>


      <Swiper
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        }}
        lazy={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
          <img
            src="/images/exp1.png"
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
        </SwiperSlide>
        <SwiperSlide>
          <img
              src="/images/exp2.png"
            loading="lazy"
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
        </SwiperSlide>
        <SwiperSlide>
          <img
             src="/images/exp3.png"
            loading="lazy"
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
        </SwiperSlide>
        <SwiperSlide>
          <img  src="/images/exp4.png"
            loading="lazy"
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/images/exp1.png"
            loading="lazy"
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/images/exp2.png"
            loading="lazy"
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white">
           
          </div>
          {/* <div className={styles.innerCarouselContent}>
            <p className={styles.innerCarouselContentTitle}>Munnar, Kerala</p>
            <div className={styles.innerCarouselContentSubtitle}>Tranquil Retreat Lodge</div>
            <div className={styles.innerCarouselContentPrice}>
                <div className={styles.innerCarouselContentPriceValue}>
                  FROM <span className={styles.innerCarouselContentPriceValuePrice}>₹449/night</span>
                  </div>
                <div className={styles.innerCarouselContentPriceRating}>3.4</div>
            </div>
          </div> */}
        </SwiperSlide>
      </Swiper>
      </div>
    </>
  );
}
