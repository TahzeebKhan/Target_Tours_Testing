"use client";

import { X } from "lucide-react";
import styles from "./ModifyBookingModal.module.css";

const ModifyBookingModal = ({ bookingId, checkIn, checkOut, onClose }) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Modify Booking</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Booking Info */}
        <div className={`${styles.bookingInfo} `}>
          <div className="w-full">
            <div className={`flex justify-between items-center w-full`}>
              <p className={styles.label}>Current Booking</p>

              <span className={styles.bookingId}>Booking ID: #{bookingId}</span>
            </div>

            <p className={styles.subText}>
              Check-in: {checkIn} | Check-out: {checkOut}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={styles.form}>
          <div className={styles.field}>
            <label>NEW CHECK-IN DATE *</label>
            <input type="date" />
          </div>

          <div className={styles.field}>
            <label>NEW CHECK-OUT DATE *</label>
            <input type="date" />
          </div>
        </div>

        {/* Notice */}
        <div className={styles.notice}>
          <strong>Important Notice</strong>
          <p>
            Date changes are subject to availability. Additional charges may
            apply if the new dates have different pricing.
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancel}>CANCEL BOOKING</button>
          <button className={styles.confirm}>CONFIRM CHANGE</button>
        </div>
      </div>
    </div>
  );
};

export default ModifyBookingModal;
