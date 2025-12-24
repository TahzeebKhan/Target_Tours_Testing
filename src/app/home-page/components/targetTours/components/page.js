"use client";
import React, { useState } from "react";
import styles from "./newPage.module.css";
import { AnimatePresence, motion } from "framer-motion";

// const cards = [
//   { id: 1, title: "Holiday", img: "/images/img1.jpg" },
//   { id: 2, title: "Insurance", img: "/images/img2.jpg" },
//   { id: 3, title: "Flights", img: "/images/img3.jpg" },
//   { id: 4, title: "Uzbekistan", img: "/images/img4.jpg" },
//   { id: 5, title: "Senegal", img: "/images/img5.jpg" },
//   { id: 6, title: "Madagascar", img: "/images/img6.jpg" },

// ];

const HoverExpandCarousel = ({ cards = [], activeTab }) => {
  const [startIndex, setStartIndex] = useState(0);

  // SSR safety: if no cards provided, render nothing
  if (!cards.length) return null;

  const orderedCards = [
    ...cards.slice(startIndex),
    ...cards.slice(0, startIndex),
  ];

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className={styles.carouselSection}>
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
          <div className={styles["hover-carousel"]}>
            {orderedCards.slice(0, 3).map((card, idx) => (
              <div
                className={`${styles["hover-card"]} ${
                  idx == 0 ? styles.leftCard : ""
                } ${idx == 1 ? styles.midCard : ""} ${
                  idx == 2 ? styles.rightCard : ""
                }`}
                key={card.id}
              >
                <img
                  className={`${idx == 0 ? styles.leftImg : ""} ${
                    idx == 1 ? styles.midImg : ""
                  } ${idx == 2 ? styles.rightImg : ""} ${
                    card.centerImage ? styles.centerImg : ""
                  }`}
                  src={card.img}
                  alt={card.title}
                />
                 <img className={styles.bgGradient} src="/icons/Rectanglegrad.svg"/>
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
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.75 21.25L21.25 8.75"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.navButtons}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous"
          onClick={handlePrev}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="10"
            viewBox="0 0 12 10"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.12184 0.128139C5.2927 0.298992 5.2927 0.576005 5.12184 0.746858L1.49372 4.375H10.9375C11.1791 4.375 11.375 4.57088 11.375 4.8125C11.375 5.05411 11.1791 5.25 10.9375 5.25H1.49372L5.12184 8.87816C5.2927 9.04902 5.2927 9.32598 5.12184 9.49684C4.95098 9.6677 4.67402 9.6677 4.50314 9.49684L0.128139 5.12184C-0.0427131 4.95098 -0.0427131 4.67402 0.128139 4.50316L4.50314 0.128139C4.67402 -0.0427131 4.95098 -0.0427131 5.12184 0.128139Z"
              fill="white"
            />
          </svg>
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Next"
          onClick={handleNext}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.56566 2.31564C7.3948 2.48649 7.3948 2.76351 7.56566 2.93436L11.1938 6.5625H1.75C1.50838 6.5625 1.3125 6.75838 1.3125 7C1.3125 7.24161 1.50838 7.4375 1.75 7.4375H11.1938L7.56566 11.0657C7.3948 11.2365 7.3948 11.5135 7.56566 11.6843C7.73652 11.8552 8.01348 11.8552 8.18436 11.6843L12.5594 7.30934C12.7302 7.13848 12.7302 6.86152 12.5594 6.69066L8.18436 2.31564C8.01348 2.14479 7.73652 2.14479 7.56566 2.31564Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default HoverExpandCarousel;
