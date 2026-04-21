"use client";

import React, { useState } from "react";
import styles from "./Mobile_footer.module.css";

export default function Mobile_footer({
  setShowPriceSummaryPopup,
  setCurrentStep,
  currentStep,
  totalAmount,
}) {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => {
    setIsActive((prev) => !prev);
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
              <span className={styles.footerTotalLabel}>Total Amount</span>

              <span
                onClick={() => setShowPriceSummaryPopup(true)}
                className={styles.infoIcon}
              >
                !
              </span>
            </div>

            <div className={styles.footerPrice}>{totalAmount}</div>
          </div>

          <button
            onClick={() => setCurrentStep(currentStep + 1)}
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
