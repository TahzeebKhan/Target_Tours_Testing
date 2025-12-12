"use client";
import React, { useRef, useState } from 'react';
import { Virtual, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import InnerCarousel from '../../exploreCarousel/component/InnerCarousel';
import styles from './Carousel.module.css';

export default function Carousel() {
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
        slidesPerView={3}
        centeredSlides={false}
        spaceBetween={30}
        pagination={{
          type: 'fraction',
        }}
        navigation={true}
        virtual
      >

          <SwiperSlide key={"1"} virtualIndex={1}>
            <div className={styles.cardContainer1}>
              {/* <InnerCarousel /> */}
              <img src="/images/img1.jpg" alt="image" />
          
            </div>
          </SwiperSlide>
          <SwiperSlide key={"2"} virtualIndex={2}>
            <div className={styles.cardContainer2}>
              {/* <InnerCarousel /> */}
              <img src="/images/img1.jpg" alt="image" />    
            </div>
          </SwiperSlide>
          
          <SwiperSlide key={"3"} virtualIndex={3}>
            <div className={styles.cardContainer3}>
              {/* <InnerCarousel /> */}
              <img src="/images/img1.jpg" alt="image" />
            </div>
          </SwiperSlide>
          <SwiperSlide key={"3"} virtualIndex={3}>
            <div className={styles.cardContainer3}>
              {/* <InnerCarousel /> */}
              <img src="/images/img1.jpg" alt="image" />
            </div>
          </SwiperSlide>
          <SwiperSlide key={"3"} virtualIndex={3}>
            <div className={styles.cardContainer3}>
              {/* <InnerCarousel /> */}
              <img src="/images/img1.jpg" alt="image" />
            </div>
          </SwiperSlide>

      </Swiper>
    </div>
     

     
    </>
  );
}
