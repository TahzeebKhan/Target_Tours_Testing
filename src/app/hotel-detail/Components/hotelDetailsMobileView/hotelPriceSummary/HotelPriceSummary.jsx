"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./HotelPriceSummary.module.css";

const HotelPriceSummary = ({
  onClose,
  lineItems = [],
  totalAmount = "₹ 0",
  subtext = "Includes taxes and service fees",
}) => {
  return (
    <motion.div
      className={styles.container}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.modalOverlay}
        onClick={(event) => event.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 30,
        }}
      >
        <div className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>PRICE SUMMARY</h2>

            <button
              type="button"
              className={styles.closeIcon}
              onClick={onClose}
              aria-label="Close price summary"
            >
              <Image
                src="/images/Close.svg"
                alt=""
                width={20}
                height={20}
              />
            </button>
          </header>

          <div className={styles.content}>
            {lineItems.map((item, index) => (
              <div key={item.id || `${item.label}-${index}`} className={styles.row}>
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
            <div className={styles.divider} />
          </div>

          <div className={styles.totalSection}>
            <div className={styles.totalTextGroup}>
              <h3 className={styles.totalTitle}>Total Amount</h3>
              <p className={styles.subtext}>{subtext}</p>
            </div>
            <div className={styles.totalPrice}>{totalAmount}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HotelPriceSummary;
