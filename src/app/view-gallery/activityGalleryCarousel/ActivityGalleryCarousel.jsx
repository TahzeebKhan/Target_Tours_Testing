"use client";
import React, { useState } from "react";
import styles from "./ActivityGalleryCarousel.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { useEffect } from "react";

const useIsMobile = (breakpoint = 600) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
};

const ActivityGalleryCarousel = () => {
  const [swiperRef, setSwiperRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handlePrev = () => {
    swiperRef?.slidePrev();
  };

  const handleNext = () => {
    swiperRef?.slideNext();
  };

  const images = [
    {
      id: 1,
      title: "Alpine Hiking Trail",
      image: "/gallery/item1.png",
    },
    {
      id: 2,
      title: "Glacier Walk Experience",
      image: "/gallery/item2.png",
    },
    {
      id: 3,
      title: "Old Town Walking Tour",
      image: "/gallery/item3.png",
    },
    {
      id: 4,
      title: "Wildlife Safari Experience",
      image: "/gallery/item4.png",
    },
    {
      id: 5,
      title: "Botanical Garden Visit",
      image: "/gallery/item5.png",
    },
    {
      id: 6,
      title: "Luxury Yacht Experience",
      image: "/gallery/item6.png",
    },
    {
      id: 7,
      title: "Luxury Yacht Experience",
      image: "/gallery/item6.png",
    },
    {
      id: 8,
      title: "Luxury Yacht Experience",
      image: "/gallery/item6.png",
    },
    {
      id: 9,
      title: "Luxury Yacht Experience",
      image: "/gallery/item6.png",
    },
  ];
  const isMobile = useIsMobile(600);
  const router = useRouter();
  const toSlug = (text) => text.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Activity Gallery</h2>
      {isMobile ? (
        /* ================= MOBILE VIEW (NO SWIPER) ================= */
        <div className={styles.mobileGrid}>
          {images.map((image) => (
            <div
              key={image.id}
              className={styles.mobileItem}
              onClick={() =>
                router.push(`/view-gallery/${toSlug(image.title)}`)
              }
            >
              <img src={image.image} alt={image.title} />
              <h3>{image.title}</h3>
            </div>
          ))}
        </div>
      ) : (
        /* ================= DESKTOP VIEW (SWIPER) ================= */
        <div className={styles.carouselContainer}>
          <div className={styles.carousel}>
            <Swiper
              modules={[Navigation]}
              onSwiper={setSwiperRef}
              onSlideChange={handleSlideChange}
              slidesPerView="auto"
              spaceBetween={32}
              className={styles.carousels}
            >
              {images.map((image) => (
                <SwiperSlide key={image.id} className={styles.slide}>
                  <div className={styles.carouselItem}>
                    <img src={image.image} alt={image.title} />
                    <h3 className={styles.carouselItemHeading}>
                      {image.title}
                    </h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className={styles.btnContainer}>
            <div className={styles.leftBtn} onClick={handlePrev}>
              <img
                src="/icons/right.svg"
                alt="Previous"
                style={{ transform: "rotate(180deg)" }}
              />
            </div>
            <div className={styles.rightBtn} onClick={handleNext}>
              <img src="/icons/right.svg" alt="Next" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityGalleryCarousel;
