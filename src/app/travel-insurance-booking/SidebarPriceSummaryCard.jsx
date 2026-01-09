"use client"
import { useFlightBooking } from "./FlightBookingContext";
import Image from "next/image";
import styles from "./SidebarPriceSummaryCard.module.css";
import { Plane, ShieldCheck } from "lucide-react";

export default function SidebarPriceSummaryCard() {
  const { prices, currentStep } = useFlightBooking();

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Coverage summary</h3>
      <div className={styles.subCard}>
        <div className={styles.iconContainer}>
          <Plane className={styles.icon} />
        </div>
        <div className={styles.subTextContainer}>
          <p className={styles.subTitle}>Thailand + 2 more</p>
          <p className={styles.subText}>15 Jan - 23 Jan, 2026</p>
        </div>
      </div>

      <div className={styles.subCard}>
        <div className={styles.iconContainer}>
          <ShieldCheck className={styles.icon} />
        </div>
        <div className={styles.subTextContainer}>
          <p className={styles.subTitle}>Standard plan</p>
          <p className={styles.subText}>₹ 712,000 / Person</p>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.breakup}>
        <div className={styles.row}>
          <span className={styles.label}>Medical sum insured X 3</span>
          <span className={styles.valueSemiBold}>₹ 64,126</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Policy Premium</span>
          <span className={styles.valueSemiBold}>₹1,106</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Coupon Discount</span>
          <span className={`${styles.value} ${styles.negative}`}>-₹5538.56</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Taxes & Fees</span>
          <span className={styles.valueTax}>₹2,819</span>
        </div>
      </div>

      <div className={styles.totalBox}>
        <div className={styles.totalAmountCont}>
          <p className={styles.totalLabel}>Total Amount</p>
           <p className={styles.totalAmount}>₹ 66,945</p>
         
        </div>
        <p className={styles.note}>Includes taxes and service fees</p>
      </div>

    </div>
  );
}
