"use client";
import React, { useState } from "react";
import styles from "./MobileCarousel.module.css";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MobileCarousel = ({ cards }) => {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? cards.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === cards.length - 1 ? 0 : i + 1));

  const card = cards[index];

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Image */}
        <div className={styles.imageWrap}>
          <Image
            src={card.img}
            alt={card.title}
            fill
            className={styles.image}
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <span className={styles.badge}>{card.badge}</span>

          <h3 className={styles.title}>{card.title}</h3>

          <p className={styles.cities}>{card.cities}</p>

          <p className={styles.price}>
            INR 2,30,000<span>/Adult</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button onClick={prev} aria-label="Previous">
          <ChevronLeft size={18} />
        </button>
        <button onClick={next} aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default MobileCarousel;
