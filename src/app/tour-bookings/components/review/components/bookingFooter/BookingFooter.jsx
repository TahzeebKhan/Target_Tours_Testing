"use client";
import React from "react";
import styles from "./BookingFooter.module.css";

const BookingFooter = ({
  amount = "₹ 66,945",
  buttonLabel = "CONTINUE BOOKING",
  disabled = false,
  onContinue,
  title,
  onInfoClick,
}) => {
  return (
    <div className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* LEFT */}
        <div className={styles.amountSection}>
          <div className={styles.label}>
            {title}
            <span className={styles.infoIcon} onClick={onInfoClick}>!</span>
          </div>
          <div className={styles.amount}>{amount}</div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          className={styles.continueBtn}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onContinue?.();
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default BookingFooter;
