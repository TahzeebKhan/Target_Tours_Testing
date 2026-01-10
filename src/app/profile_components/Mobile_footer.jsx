"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./Mobile_footer.module.css";

export default function Mobile_footer() {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => {
    setIsActive(prev => !prev);
  };

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ""}`}
      onClick={toggleActive}
    >
      <div className={styles.modalOverlay}>
        <footer className={styles.footer}>
          <div className={styles.footerInfo}>
            <div className={styles.footerLabelGroup}>
              <span className={styles.footerTotalLabel}>
                Total Amount
              </span>

              <Image
                src="/icons/info-circle.svg"
                alt="Info"
                width={16}
                height={16}
              />
            </div>

            <div className={styles.footerPrice}>₹ 66,945</div>
          </div>

          <button
            className={styles.continueButton}
            type="button"
          >
            CONTINUE BOOKING
          </button>
        </footer>
      </div>
    </div>
  );
}
