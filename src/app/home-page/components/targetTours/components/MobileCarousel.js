"use client";
import React, { useState } from "react";
import styles from "./MobileCarousel.module.css";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/navigation";

const MobileCarousel = ({ cards = [], activeTab }) => {
  const [swiperRef, setSwiperRef] = useState(null)
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();

  if (!cards.length) return null;

  const orderedCards = [
    ...cards.slice(startIndex),
    ...cards.slice(0, startIndex),
  ];

  const visibleCards = orderedCards.slice(0, 3);

  const next = () => {
    setStartIndex((prev) => (prev + 1) % cards.length);
  };

  const prev = () => {
    setStartIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

   const handlePrev = () => {
        swiperRef?.slidePrev()
    }

    const handleNext = () => {
        swiperRef?.slideNext()
    }

  return (
    <div className={styles.wrapper}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {" "}
          <div className={styles.viewport}>
            <div className={styles.slider}>
                <Swiper
                modules={[Navigation]}
                onSwiper={setSwiperRef}
                 slidesPerView={1.1} // ✅ peek effect
                spaceBetween={12}
                className={styles.carousel}
                centeredSlides={true} // ✅ center main card
                breakpoints={{
                0: {
                  slidesPerView: 1.1,
                  centeredSlides: true,
                  spaceBetween: 12,
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

              }}
              >
                {visibleCards.map((card, idx) => (
                  <SwiperSlide key={card.id} className={styles.sliderSlide}>
                    <div
                      key={card.id}
                      className={`${styles.card} ${idx === 1 ? styles.active : styles.side
                        }`}
                      onClick={() => router.push(`/tour-details?id=${card.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.imageWrap}>
                        <Image src={card.img} alt={card.title} fill />
                      </div>

                      <div className={styles.content}>
                        <span className={styles.badge}>{card.badge}</span>
                        <h3 className={styles.title}>{card.title}</h3>
                        <p className={styles.cities}>{card.cities}</p>
                        <p className={styles.price}>
                          {card.price}
                          <span>/Adult</span>
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.controls}>
        <button onClick={handlePrev}>
          <ArrowLeft size={14} />
        </button>
        <button onClick={handleNext}>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default MobileCarousel;
