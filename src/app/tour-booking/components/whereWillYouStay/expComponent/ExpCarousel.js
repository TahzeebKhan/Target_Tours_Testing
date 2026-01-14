"use client";
import React, { useState, useEffect } from "react";
import { Virtual, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import InnerCarousel from "./InnerCarousel";
import styles from "./ExpCarousel.module.css";
import { AnimatePresence, motion } from "framer-motion";

export default function ExpCarousel({ activeTab }) {
  const [swiperRef, setSwiperRef] = useState(null);
  // track the current slidesPerView according to breakpoints so we can
  // conditionally show navigation buttons when there are more slides than visible
  const [slidesPerViewLocal, setSlidesPerViewLocal] = useState(4);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openPopup = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  const [allSlidesData, setAllSlidesData] = useState([
    {
      title: "Toronto, canada",
      subtitle: "Serene Haven Inn",
      price: "₹449/",
      rating: 3.4,
      users: 508,
      type: "Beach",
      favorite: false,
      images: ["/images/Frame1.png", "/images/Frame2.png", "/images/Frame3.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Calgary, Canadaa",
      subtitle: "Calm Waters Lodge",
      price: "₹899/",
      rating: 4.5,
      users: 1020,
      type: "Beach",
      favorite: false,
      images: ["/images/Frame2.png", "/images/Frame3.png", "/images/Frame4.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Ottawa, Canada",
      subtitle: "Quiet Escape Resort",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Beach",
      favorite: false,
      images: ["/images/Frame3.png", "/images/Frame4.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Vancouver, Canada",
      subtitle: "Peaceful Oasis Hotel",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Beach",
      favorite: false,
      images: ["/images/Frame4.png", "/images/Frame1.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Beach",
      favorite: false,
      images: ["/images/Frame3.png", "/images/Frame4.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Hiking",
      favorite: false,
      images: ["/images/Frame1.png", "/images/Frame3.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Family",
      favorite: false,
      images: ["/images/Frame2.png", "/images/Frame1.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Ski",
      favorite: false,
      images: ["/images/Frame4.png", "/images/Frame1.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Darjeeling, Bengal",
      subtitle: "Mountain View Stay",
      price: "₹699/",
      rating: 4.6,
      users: 720,
      type: "Ski",
      favorite: false,
      images: ["/images/Frame3.png", "/images/Frame4.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Ski",
      favorite: false,
      images: ["/images/Frame4.png", "/images/Frame1.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Shimla, India",
      subtitle: "Snow Peak Stay",
      price: "₹799/",
      rating: 4.5,
      users: 620,
      type: "Ski",
      favorite: false,
      images: ["/images/Frame2.png", "/images/Frame1.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
    },
    {
      title: "Manali, Himachal",
      subtitle: "Family Hill Resort",
      price: "₹599/",
      rating: 4.4,
      users: 540,
      type: "Ski",
      favorite: false,
      images: ["/images/Frame4.png", "/images/Frame1.png"],
      desc: "The Oberoi, New Delhi is situated in the heart of central Delhi overlooking the fairways of The Delhi Golf Course. The contemporary luxury hotel has 220 modern guest rooms and suites with teakwood floors, walk-in closets, luxury Italian marble bathrooms, and large picture windows that overlook either the greens or historic Humayun's Tomb. Butler service is available 24 hours a day. Restaurants include an all-day international eatery, a contemporary Indian restaurant and a Chinese restaurant perched on the rooftop. Other amenities include a spa, po"
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

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1200) setSlidesPerViewLocal(4);
      else if (w >= 768) setSlidesPerViewLocal(3);
      else if (w >= 576) setSlidesPerViewLocal(2);
      else setSlidesPerViewLocal(1.1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <div
        style={{ maxWidth: "1520px", margin: "0 auto" }}
        className="ExpCarouselWrapper"
      >


        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // 🔑 IMPORTANT
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {" "}
            <Swiper
              modules={[Virtual]}
              onSwiper={setSwiperRef}
              spaceBetween={16}
              centeredSlides={true} // ✅ center main card
              slidesPerView={1.1} // ✅ peek effect
              pagination={{ clickable: true }} // ✅ bullets
              navigation={false} // ❌ hide arrows on mobile
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

                769: {
                  slidesPerView: 2,
                  centeredSlides: false,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 3,
                  centeredSlides: false,
                  spaceBetween: 16,
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
                      <p className={styles.innerCarouselContentTitle}>
                        {item.title}
                      </p>
                      <div className={styles.innerCarouselContentSubtitle}>
                        {item.subtitle}
                      </div>

                      <div className={styles.innerCarouselContentPrice}>
                        <button
                          className={styles.readMore}
                          onClick={() => openPopup(item)}
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}

            </Swiper>
          </motion.div>
        </AnimatePresence>


        <AnimatePresence>
          {isPopupOpen && selectedItem && (
            <motion.div
              className={styles.popupOverlay}
              onClick={closePopup}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={styles.popupCard}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header */}
                <div className={styles.popupHeader}>
                  <h4>
                    Your Stay For – <span>{selectedItem.subtitle}</span>
                  </h4>
                  <button onClick={closePopup} className={styles.closeBtn}>✕</button>
                </div>

                {/* Content */}
                <div className={styles.popupContent}>
                  {/* LEFT IMAGE */}
                  <div className={styles.popupLeft}>
                    <img src={selectedItem.images[0]} alt="" />
                  </div>

                  {/* RIGHT TEXT */}
                  <div className={styles.popupRight}>
                    <h2>{selectedItem.subtitle}</h2>
                    <span>{selectedItem.title.toUpperCase()}</span>

                    <p>
                      {selectedItem.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Navigation Buttons - show only when there are more slides than visible */}
        {slides.length > slidesPerViewLocal && (
          <div className={styles.btnContainer}>
            <div className={styles.btn} onClick={() => swiperRef?.slidePrev()}>
              <img src="/icons/left.svg" alt="" />
            </div>

            <div className={styles.btn} onClick={() => swiperRef?.slideNext()}>
              <img src="/icons/right.svg" alt="" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
