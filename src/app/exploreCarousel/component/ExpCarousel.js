"use client";
import React, { useState } from "react";
import { Virtual, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import InnerCarousel from "./InnerCarousel";
import styles from "./ExpCarousel.module.css";

export default function ExpCarousel({ activeTab }) {
  const [swiperRef, setSwiperRef] = useState(null);

  const [allSlidesData, setAllSlidesData] = useState([
    {
      title: "Munnar, Kerala",
      subtitle: "Tranquil Retreat Lodge",
      price: "₹449/",
      rating: 3.4,
      users: 508,
      type: "Beach",
      favorite: false,
      images: ["/images/1.webp", "/images/2.webp", "/images/3.webp"]
    },
    {
      title: "Goa, India",
      subtitle: "Blue Lagoon Resort",
      price: "₹899/",
      rating: 4.5,
      users: 1020,
      type: "Beach",
      favorite: false,
      images: ["/images/2.webp", "/images/3.webp", "/images/4.webp"]
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Beach",
      favorite: false,
      images: ["/images/3.webp", "/images/4.webp"]
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Beach",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"]
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Beach",
      favorite: false,
      images: ["/images/3.webp", "/images/4.webp"]
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Hiking",
      favorite: false,
      images: ["/images/3.webp", "/images/4.webp"]
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Family",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"]
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Ski",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"]
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Ski",
      favorite: false,
      images: ["/images/3.webp", "/images/4.webp"]
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Ski",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"]
    },
    {
      title: "Shimla, India",
      subtitle: "Snow Peak Stay",
      price: "₹799/",
      rating: 4.5,
      users: 620,
      type: "Ski",
      favorite: false,
      images: ["/images/exp2.png", "/images/exp1.png"]
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Ski",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"]
    },
    {
      title: "Varanasi, India",
      subtitle: "Cultural Heritage Home",
      price: "₹349/",
      rating: 4.2,
      users: 410,
      type: "Culture",
      favorite: false,
      images: ["/images/exp3.png", "/images/exp2.png"]
    },
    {
      title: "Rishikesh, India",
      subtitle: "Yoga & Wellness Retreat",
      price: "₹991/",
      rating: 4.8,
      users: 880,
      type: "Wellness and Retreat",
      favorite: false,
      images: ["/images/exp1.png", "/images/exp3.png"]
    },
    {
      title: "Varanasi, India",
      subtitle: "Cultural Heritage Home",
      price: "₹349/",
      rating: 4.2,
      users: 410,
      type: "Wellness and Retreat",
      favorite: false,
      images: ["/images/exp3.png", "/images/exp2.png"]
    },

    {
      title: "Varanasi, India",
      subtitle: "Cultural Heritage Home",
      price: "₹349/",
      rating: 4.2,
      users: 410,
      type: "Wellness and Retreat",
      favorite: false,
      images: ["/images/exp3.png", "/images/exp2.png"]
    },
    {
      title: "Shimla, India",
      subtitle: "Snow Peak Stay",
      price: "₹799/",
      rating: 4.5,
      users: 620,
      type: "Wellness and Retreat",
      favorite: false,
      images: ["/images/exp2.png", "/images/exp1.png"]
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Wellness and Retreat",
      favorite: false,
      images: ["/images/4.webp", "/images/1.webp"]
    },
  ]);

  // Filter based on active tab
  const slides =
    activeTab === "All"
      ? allSlidesData.map((item, index) => ({ ...item, originalIndex: index }))
      : allSlidesData
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter((item) => item.type === activeTab);

  // Toggle favorite
  const toggleFavorite = (index) => {
    const updated = [...allSlidesData];
    updated[index].favorite = !updated[index].favorite;
    setAllSlidesData(updated);
  };

  return (
    <>
      <div
        style={{ maxWidth: "1520px", margin: "0 auto" }}
        className="ExpCarouselWrapper"
      >
        {/* <Swiper
          modules={[Virtual]}
          onSwiper={setSwiperRef}  // ✅ FIXED (important!)
          slidesPerView={4}
          centeredSlides={false}
          spaceBetween={30}
          pagination={{ type: "fraction" }}
          navigation={true}
          virtual
          className={styles.swiperContainer}
          breakpoints={{
            0: {
              slidesPerView: 3, // mobile
            },
            576: {
              slidesPerView: 3, // small tablets
            },
            991: {
              slidesPerView: 4, // ✅ exactly at 991px
            },
          }}
        > */}
        <Swiper
          modules={[Virtual,]}
          onSwiper={setSwiperRef}
          spaceBetween={16}
          centeredSlides={true}            // ✅ center main card
          slidesPerView={1.1}              // ✅ peek effect
          pagination={{ clickable: true }} // ✅ bullets
          navigation={false}               // ❌ hide arrows on mobile
          virtual
          className={styles.swiperContainer}
          breakpoints={{
            0: {
              slidesPerView: 1.1,
              centeredSlides: true,
              spaceBetween: 16,
            },
            576: {
              slidesPerView: 2,
              centeredSlides: false,
              spaceBetween: 20,
            },

            768: {
              slidesPerView: 3,
              centeredSlides: false,
              spaceBetween: 30,
            },
            1200: {
              slidesPerView: 4,
              centeredSlides: false,
              spaceBetween: 30,
            },
          }}
        >

          {slides.map((item, index) => (
            <SwiperSlide key={index} virtualIndex={index}>
              <div className={`${styles.cardItem} cardItem`}>

                <InnerCarousel
                  images={item.images}
                  favorite={item.favorite}
                  onFavorite={() => toggleFavorite(item.originalIndex)}
                />

                <div className={styles.innerCarouselContent}>
                  <p className={styles.innerCarouselContentTitle}>{item.title}</p>
                  <div className={styles.innerCarouselContentSubtitle}>
                    {item.subtitle}
                  </div>

                  <div className={styles.innerCarouselContentPrice}>
                    <div className={styles.innerCarouselContentPriceValue}>
                      FROM{" "}
                      <span className={styles.innerCarouselContentPriceValuePrice}>
                        {item.price}
                        <span className={styles.perNight}>Night</span>
                      </span>
                      
                    </div>

                    <div className={styles.innerCarouselContentPriceRating}>
                      <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                        <path
                          d="M5.05724 0.69121C5.3566 -0.230101 6.66001 -0.2301 6.95936 0.691211L7.69216 2.94653C7.82603 3.35856 8.20999 3.63752 8.64321 3.63752L11.0146 3.63752C11.9833 3.63752 12.3861 4.87713 11.6024 5.44653L9.68389 6.8404C9.3334 7.09504 9.18675 7.54641 9.32062 7.95843L10.0534 10.2138C10.3528 11.1351 9.29829 11.9012 8.51458 11.3318L6.59609 9.93792C6.2456 9.68328 5.771 9.68328 5.42052 9.93792L3.50202 11.3318C2.71831 11.9012 1.66383 11.1351 1.96318 10.2138L2.69598 7.95843C2.82986 7.54641 2.6832 7.09504 2.33271 6.8404L0.414218 5.44653C-0.369496 4.87713 0.0332797 3.63752 1.002 3.63752L3.37339 3.63752C3.80662 3.63752 4.19057 3.35856 4.32445 2.94653L5.05724 0.69121Z"
                          fill="#FF8800"
                        />
                      </svg>
                      <span className={styles.ratting}>{item.rating}</span>
                      <span className={styles.user}>({item.users})</span>
                    </div>
                  </div>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <div className={styles.btnContainer}>
          <div
            className={styles.btn}
            onClick={() => swiperRef?.slidePrev()}
          >
            <img src="/icons/left.svg" alt="" />
          </div>

          <div
            className={styles.btn}
            onClick={() => swiperRef?.slideNext()}
          >
            <img src="/icons/right.svg" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
