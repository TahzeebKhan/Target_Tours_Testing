"use client";

import Image from "next/image";
import styles from "./PriceSummary.module.css";
import { useState } from "react";

export default function PriceSummary({ onClose }) {
  const lineItems = [
    { label: "1x Adult", value: "₹ 64,126" },
    { label: "1x Cabin baggage", value: "Included", isGreen: true },
    { label: "1x Checked baggage 15kg", value: "Included", isGreen: true },
    { label: "Seat Selection", value: "Free", isGreen: true },
    { label: "Meals", value: "Included", isGreen: true },
    { label: "Taxes & Fees", value: "₹ 2,819" },
  ];

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

  return (
    <div className={styles.container} onClick={onClose}>
      <div
        className={`${styles.modalOverlay} ${isClosing ? styles.slideOut : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>PRICE SUMMARY</h2>

            <button
              type="button"
              className={styles.closeIcon}
              onClick={handleClose}
              aria-label="Close"
            >
              <Image
                src="/images/Close.svg"
                alt="Close"
                width={20}
                height={20}
              />
            </button>
          </header>

          <div className={styles.content}>
            {lineItems.map((item, index) => (
              <div key={index} className={styles.row}>
                <span className={styles.label}>{item.label}</span>
                <span
                  className={`${styles.value} ${item.isGreen ? styles.green : ""
                    }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.dividerWrapper}>
            <div className={styles.divider} />
          </div>

          <div className={styles.totalSection}>
            <div className={styles.totalTextGroup}>
              <h3 className={styles.totalTitle}>Total Amount</h3>
              <p className={styles.subtext}>
                Includes taxes and service fees
              </p>
            </div>
            <div className={styles.totalPrice}>₹ 66,945</div>
          </div>
        </div>
      </div>
    </div>
  );
}
