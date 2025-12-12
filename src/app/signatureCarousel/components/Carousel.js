"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/navigation";
import "swiper/css/pagination";


const Carousel = () => {
  return (
    <Swiper
      modules={[EffectCreative, Navigation, Pagination]}
      effect="creative"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={"auto"}
      navigation={true}
      pagination={{ clickable: true }}
      creativeEffect={{
        perspective: true,
        prev: {
          shadow: false,
          translate: ["-30%", 0, -200],
        },
        next: {
          shadow: false,
          translate: ["30%", 0, -200],
        },
      }}
      style={{ width: "100%", padding: "20px 0" }}
    >
      <SwiperSlide style={{ width: "auto", display: "flex", justifyContent: "center" }}>
        <img src="/images/img1.jpg" alt="signature1" style={{ maxWidth: "50%", height: "auto" }} />
      </SwiperSlide>
      <SwiperSlide style={{ width: "auto", display: "flex", justifyContent: "center" }}>
        <img src="/images/img1.jpg" alt="signature2" style={{ maxWidth: "50%", height: "auto" }} />
      </SwiperSlide>
      <SwiperSlide style={{ width: "auto", display: "flex", justifyContent: "center" }}>
        <img src="/images/img1.jpg" alt="signature3" style={{ maxWidth: "50%", height: "auto" }} /> 
      </SwiperSlide>
      <SwiperSlide style={{ width: "auto", display: "flex", justifyContent: "center" }}>
        <img src="/images/img1.jpg" alt="signature1" style={{ maxWidth: "50%", height: "auto" }} />
      </SwiperSlide>
      <SwiperSlide style={{ width: "auto", display: "flex", justifyContent: "center" }}>
        <img src="/images/img1.jpg" alt="signature2" style={{ maxWidth: "50%", height: "auto" }} />
      </SwiperSlide>
      <SwiperSlide style={{ width: "auto", display: "flex", justifyContent: "center" }}>
        <img src="/images/img1.jpg" alt="signature3" style={{ maxWidth: "50%", height: "auto" }} /> 
      </SwiperSlide>
    </Swiper>
  );
};

export default Carousel
