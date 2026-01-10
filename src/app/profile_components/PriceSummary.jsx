"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./PriceSummary.module.css";

export default function PriceSummary() {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const lineItems = [
    { label: "1x Adult", value: "₹ 64,126", isBold: false },
    { label: "1x Cabin baggage", value: "Included", isGreen: true },
    { label: "1x Checked baggabe 15kg", value: "Included", isGreen: true },
    { label: "Seat Selection", value: "Free", isGreen: true },
    { label: "Meals", value: "Included", isGreen: true },
    { label: "Taxes & Fees", value: "₹ 2,819", isBold: false },
  ];

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ""}`}
      onClick={toggleActive}
    >
      <div className={styles.modalOverlay}>
        <div className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>PRICE SUMMARY</h2>
            <div className={styles.closeIcon}>
              <Image
                src="/images/CLose.svg"
                alt="Close"
                width={20}
                height={20}
              />
            </div>
          </header>

          <div className={styles.content}>
            {lineItems.map((item, index) => (
              <div key={index} className={styles.row}>
                <span className={styles.label}>{item.label}</span>
                <span
                  className={`${styles.value} ${
                    item.isGreen ? styles.green : ""
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.dividerWrapper}>
            <div className={styles.divider}></div>
          </div>

          <div className={styles.totalSection}>
            <div className={styles.totalTextGroup}>
              <h3 className={styles.totalTitle}>Total Amount</h3>
              <p className={styles.subtext}>Includes taxes and service fees</p>
            </div>
            <div className={styles.totalPrice}>₹ 66,945</div>
          </div>
        </div>
      </div>
    </div>
  );
}
