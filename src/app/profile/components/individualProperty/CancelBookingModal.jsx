"use client";

import { useState } from "react";
import { X } from "lucide-react";
import styles from "./CancelBookingModal.module.css";
import api from "@/shared/services/axios";
import { toast } from "react-toastify";

const CancelBookingModal = ({
  hotelName,
  airline,
  route,
  bookingId,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmCancel = async () => {
    setIsLoading(true);

    try {
      const response = await api.post("/hotel-search/cancel-booking", {
        domain: process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:1337",
        booking_id: bookingId,
      });

      if (response?.status === 200 || response?.data) {
        toast.success(
          response?.data?.message || "Booking cancelled successfully."
        );
        if (onSuccess) onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Unable to cancel booking. Please try again.";
      toast.error(message);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Cancel Booking</h2>
          <button onClick={onClose} disabled={isLoading}>
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
              <img
                src={hotelName ? "/icons/baggage-icon.svg" : "/icons/flight-icon.svg"}
                alt="booking type icon"
              />
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
          <button
            className={styles.cancel}
            onClick={onClose}
            disabled={isLoading}
          >
            KEEP BOOKING
          </button>
          <button
            className={styles.confirm}
            onClick={handleConfirmCancel}
            disabled={isLoading}
          >
            {isLoading ? "CANCELING..." : "YES, CANCEL BOOKING"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
