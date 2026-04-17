"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./PriceSummary.module.css";
import { useTourBooking } from "@/app/tour-bookings/TourBookingContext";

export default function PriceSummary({ onClose }) {
  const { packageDetails, prices } = useTourBooking();
  const travelerCount = prices.travelerCount || 1;
  const lineItems = [
    { label: `${travelerCount}x Adult`, value: `₹ ${Number(prices.baseFare || 0).toLocaleString("en-IN")}` },
    { label: `${travelerCount}x Cabin baggage`, value: "Included", isGreen: true },
    { label: `${travelerCount}x Checked baggage 15kg`, value: "Included", isGreen: true },
    { label: "Seat Selection", value: "Free", isGreen: true },
    { label: "Meals", value: "Included", isGreen: true },
    { label: "Taxes & Fees", value: `₹ ${Number(packageDetails?.price?.taxes || 0).toLocaleString("en-IN")}` },
  ];

  return (

    <motion.div
      className={styles.container}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 👇 BOTTOM SHEET */}
      <motion.div
        className={styles.modalOverlay}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}   // ⬇️ start off-screen
        animate={{ y: 0 }}        // ⬆️ slide up
        exit={{ y: "100%" }}      // ⬇️ slide down
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
            <div className={styles.totalPrice}>
              ₹ {Number(prices.total || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
