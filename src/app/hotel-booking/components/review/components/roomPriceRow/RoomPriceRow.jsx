"use client";

import { useState } from "react";
import styles from "./RoomPriceRow.module.css";

export default function RoomPriceRow({
  image,
  title,
  price,
  quantity,
  maxQuantity = 5,
  onIncrease,
  onDecrease,
}) {
  return (
    <div className={styles.card}>
      {/* Image */}
      <img src={image} alt={title} className={styles.image} />

      {/* Content */}
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <p className={styles.title}>{title}</p>
        </div>

        {/* Price */}
        <div className={styles.priceContainer}>
          <div className={styles.priceSection}>
            <p className={styles.price}>₹ {price.toFixed(2)}</p>
            <p className={styles.perNight}>per/night</p>
          </div>

          {/* Counter */}
          <div className={styles.counter}>
            <button
              className={styles.btn}
              onClick={onDecrease}
              disabled={quantity <= 1}
            >
              <svg
                width="11"
                height="2"
                viewBox="0 0 11 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.75 1.49995C0.5375 1.49995 0.359375 1.42805 0.215625 1.28425C0.071875 1.14043 0 0.962233 0 0.74965C0 0.53705 0.071875 0.358958 0.215625 0.215375C0.359375 0.0717914 0.5375 0 0.75 0H10.25C10.4625 0 10.6406 0.0718998 10.7843 0.2157C10.9281 0.359516 11 0.537717 11 0.7503C11 0.9629 10.9281 1.14099 10.7843 1.28457C10.6406 1.42816 10.4625 1.49995 10.25 1.49995H0.75Z"
                  fill="#000033"
                />
              </svg>
            </button>

            <span className={styles.count}>{quantity}</span>

            <button className={styles.btn} onClick={onIncrease}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.75 7.24995H0.75C0.5375 7.24995 0.359375 7.17805 0.215625 7.03425C0.071875 6.89043 0 6.71223 0 6.49965C0 6.28705 0.071875 6.10896 0.215625 5.96538C0.359375 5.82179 0.5375 5.75 0.75 5.75H5.75V0.75C5.75 0.5375 5.8219 0.359375 5.9657 0.215625C6.10952 0.071875 6.28772 0 6.5003 0C6.7129 0 6.89099 0.071875 7.03457 0.215625C7.17816 0.359375 7.24995 0.5375 7.24995 0.75V5.75H12.25C12.4625 5.75 12.6406 5.8219 12.7843 5.9657C12.9281 6.10952 13 6.28772 13 6.5003C13 6.7129 12.9281 6.89099 12.7843 7.03458C12.6406 7.17816 12.4625 7.24995 12.25 7.24995H7.24995V12.25C7.24995 12.4625 7.17805 12.6406 7.03425 12.7843C6.89043 12.9281 6.71223 13 6.49965 13C6.28705 13 6.10896 12.9281 5.96537 12.7843C5.82179 12.6406 5.75 12.4625 5.75 12.25V7.24995Z"
                  fill="#000033"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
