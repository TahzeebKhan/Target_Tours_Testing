"use client";

import { X } from "lucide-react";
import styles from "./CancelBookingModal.module.css";

const CancelBookingModal = ({
  hotelName,
  airline,
  route,
  bookingId,
  onClose,
}) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Cancel Booking</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Confirmation text */}
        <div className={styles.form}>
          <p className={styles.label}>
            ARE YOU SURE YOU WANT TO CANCEL THIS BOOKING?
          </p>

          {/* Booking Card */}
          <div className={styles.bookingInfo}>
            <div className={styles.iconContainer}>
              <img src={`${hotelName ?"/icons/baggage-icon.svg" : "/icons/flight-icon.svg"}`} />
            </div>
            <div>
              <p className={styles.label}>
                {hotelName ? hotelName : airline ? airline : ""}
                {route && ` – ${route}`}
              </p>
              <p className={styles.subText}>Booking ID: #{bookingId}</p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className={styles.notice}>
          <strong>Important Notice</strong>
          <p>
            This action cannot be undone. The booking will be canceled and the
            amount will be refunded to your budget.
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            KEEP BOOKING
          </button>
          <button className={styles.confirm}>YES, CANCEL BOOKING</button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
