"use client";

import React from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import styles from "./TripSummaryHeader.module.css";

const TripSummaryHeader = ({
  from = "Jakarta",
  to = "Singapore",
  dateRange = "15 Jan - 23 Jan, 2026",
  onBack,
  onEdit,
   onEditClick ,
}) => {
  return (
    <div className={styles.tripDetailsHeader}>
      <div className={styles.mainCotainer}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          <Image
            src="/icons/leftArrowTrip.svg"
            alt="Back"
            width={16}
            height={16}
          />
        </button>

        <div
          className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
        >
          <div className={styles.TripCardHeaderDetails}>
            <p className={styles.TripCardHeaderDetailsItemText}>{from}</p>
            <div className={styles.minDash}>-</div>
            <p className={styles.TripCardHeaderDetailsItemText}>{to}</p>
          </div>

          <div className={styles.TripCardHeaderBookingDate}>
            <p>{dateRange}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.editButton}
        onClick={onEdit}
      >
        <Pencil
          className={styles.editIcon}
          color="#FFFFFF"
          size={16}
            onClick={onEditClick}
  style={{ cursor: "pointer" }}
        />
      </button>
    </div>
  );
};

export default TripSummaryHeader;
