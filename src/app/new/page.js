"use client";
import React, { useState } from "react";
import styles from "./newPage.module.css";

const cards = [
  { id: 1, title: "Holiday", img: "/images/img1.jpg" },
  { id: 2, title: "Insurance", img: "/images/img2.jpg" },
  { id: 3, title: "Flights", img: "/images/img3.jpg" },
  { id: 4, title: "Uzbekistan", img: "/images/img4.jpg" },
  { id: 5, title: "Senegal", img: "/images/img5.jpg" },
  { id: 6, title: "Madagascar", img: "/images/img6.jpg" },

];

const HoverExpandCarousel = () => {
  const [startIndex, setStartIndex] = useState(0);

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

  return (
    <section className={styles.carouselSection}>
      <div className={styles["hover-carousel"]}>
        {orderedCards.slice(0, 3).map((card) => (
          <div className={styles["hover-card"]} key={card.id}>
          <img src={card.img} alt={card.title} />
            <div className={styles["card-overlay"]}>
            <h3>{card.title}</h3>
          </div>
        </div>
      ))}
    </div>

      <div className={styles.navButtons}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous"
          onClick={handlePrev}
        >
          ◀
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Next"
          onClick={handleNext}
        >
          ▶
        </button>
      </div>
    </section>
  );
};

export default HoverExpandCarousel;
