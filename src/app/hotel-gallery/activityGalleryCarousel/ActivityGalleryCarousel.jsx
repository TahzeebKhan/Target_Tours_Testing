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

const FALLBACK_IMAGES = Array.from({ length: 5 }, (_, index) => ({
  id: `fallback-gallery-${index}`,
  title: `Photo ${index + 1}`,
  image: "/fallback.png",
}));

const isGeneratedPhotoTitle = (value = "") =>
  /^photo\s+\d+$/i.test(String(value || "").trim());

const getImageTitle = (item = {}, index = 0) => {
  const title = String(item?.title || "").trim();
  const caption = String(item?.caption || "").trim();

  if (caption && (!title || isGeneratedPhotoTitle(title))) return caption;

  return (
    title ||
    caption ||
    item?.name ||
    item?.label ||
    item?.category ||
    item?.roomType ||
    `Photo ${index + 1}`
  );
};

const normalizeImages = (images = FALLBACK_IMAGES) =>
  (Array.isArray(images) ? images : FALLBACK_IMAGES)
    .map((item, index) =>
      typeof item === "string"
        ? {
            id: `gallery-image-${index}`,
            title: `Photo ${index + 1}`,
            image: item,
          }
        : {
            id: item?.id || `gallery-image-${index}`,
            title: getImageTitle(item, index),
            image: item?.image || item?.url || "",
          },
    )
    .filter((item) => item.image);

const ActivityGalleryCarousel = ({
  images = FALLBACK_IMAGES,
  disableNavigation = false,
  heading = "Hotel Gallery",
}) => {
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

  const slides = normalizeImages(images);
  const isMobile = useIsMobile(600);
  const router = useRouter();
  const toSlug = (text) => text.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{heading}</h2>
      {isMobile ? (
        /* ================= MOBILE VIEW (NO SWIPER) ================= */
        <div className={styles.mobileGrid}>
          {slides.map((image) => (
            <div
              key={image.id}
              className={styles.mobileItem}
              onClick={
                disableNavigation
                  ? undefined
                  : () => router.push(`/hotel-gallery/${toSlug(image.title)}`)
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
              breakpoints={
                {
                    600:{
                        spaceBetween: 16,
                    },
                    1200:{
                        spaceBetween: 32,
                    }
                }
              }
            >
              {slides.map((image) => (
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
