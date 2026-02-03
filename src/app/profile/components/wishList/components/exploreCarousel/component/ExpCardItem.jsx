"use client";
import React from "react";
import InnerCarousel from "./InnerCarousel";
import styles from "./ExpCarousel.module.css";

const ExpCardItem = ({ item, onToggleFavorite }) => {
  return (
    <div className={`${styles.cardItem} cardItem`}>
      <InnerCarousel
        images={item.images}
        favorite={item.favorite}
        onFavorite={onToggleFavorite}
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
  );
};

export default ExpCardItem;
