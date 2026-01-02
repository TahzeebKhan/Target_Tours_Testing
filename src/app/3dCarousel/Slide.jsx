"use client";

import React from "react";
import styles from "./Slide.module.css";

export const Slide = React.memo(function Slide(props) {
  const { data, dataIndex, isCenterSlide, swipeTo, slideIndex } = props;

  const coverImage = data[dataIndex].image;
  const text = data[dataIndex].text;

  return (
    <div className={styles.cardCard} draggable={false}>
      <div className={`${styles.cover} ${styles.fill} ${isCenterSlide ? styles.off : styles.on}`}>
        <div
          className={`${styles.cardOverlay} ${styles.fill}`}
          onClick={() => {
            if (!isCenterSlide) swipeTo(slideIndex);
          }}
        />
      </div>

      <div className={`${styles.detail} ${styles.fill}`}>
        <div className={styles.discription}>
          <img
            src={coverImage}
            alt="cover"
            className={styles.coverImage}
            
          />
          <p className={styles.text}>{text}</p>
        </div>
      </div>
    </div>
  );
});
