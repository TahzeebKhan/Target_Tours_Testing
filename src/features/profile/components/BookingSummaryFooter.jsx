"use client";

import React from "react";
import styles from "./BookingSummaryFooter.module.css";

const BookingSummaryFooter = ({
  totalAmount = "₹ 66,945",
  onContinue,
  onInfoClick,
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInfo}>
        <div className={styles.footerLabelGroup}>
          <span className={styles.footerTotalLabel}>Total Amount</span>

          <button
            type="button"
            className={styles.infoIcon}
            onClick={onInfoClick}
          >
            !
          </button>
        </div>

        <div className={styles.footerPrice}>{totalAmount}</div>
      </div>

      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
      >
        CONTINUE BOOKING
      </button>
    </footer>
  );
};

export default BookingSummaryFooter;
