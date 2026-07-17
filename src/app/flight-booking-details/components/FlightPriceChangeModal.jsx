"use client";

import React from "react";
import { useFlightBooking } from "../FlightBookingContext";
import styles from "./FlightPriceChangeModal.module.css";

const formatCurrency = (value) =>
  `₹ ${Math.round(Number(value || 0)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const FlightPriceChangeModal = () => {
  const {
    flightPriceChange,
    itineraryLoading,
    acceptFlightPriceChange,
    rejectFlightPriceChange,
  } = useFlightBooking();

  if (!flightPriceChange) return null;

  const difference = Number(flightPriceChange.difference || 0);
  const hasIncrease = difference > 0;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>Continue with new fare?</h3>
        <p>
          The selected SSR fare has changed from{" "}
          <strong>{formatCurrency(flightPriceChange.oldFare)}</strong> to{" "}
          <strong>{formatCurrency(flightPriceChange.newFare)}</strong>.
        </p>
        <p className={hasIncrease ? styles.priceIncrease : styles.priceDecrease}>
          {hasIncrease ? "Increase" : "Decrease"} amount:{" "}
          {formatCurrency(Math.abs(difference))}
        </p>
        <p>
          We will continue the booking only after you accept this updated fare.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={rejectFlightPriceChange}
            disabled={itineraryLoading}
          >
            CANCEL
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={acceptFlightPriceChange}
            disabled={itineraryLoading}
          >
            {itineraryLoading ? "CONTINUING..." : "CONTINUE WITH NEW FARE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightPriceChangeModal;
