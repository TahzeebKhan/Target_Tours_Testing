"use client";
import React, { useState } from "react";
import styles from "./MobileCarousel.module.css";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

const MobileCarousel = ({ cards = [] }) => {
  const [startIndex, setStartIndex] = useState(0);

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.viewport}>
        <div className={styles.slider}>
          {visibleCards.map((card, idx) => (
            <div
              key={card.id}
              className={`${styles.card} ${
                idx === 1 ? styles.active : styles.side
              }`}
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
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={prev}>
          <ArrowLeft size={14} />
        </button>
        <button onClick={next}>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default MobileCarousel;
