"use client";

import React from "react";
import styles from "./PriceChangeModal.module.css";

const formatCurrency = (value) =>
  `₹ ${Math.round(Number(value || 0)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const PriceChangeModal = ({
  priceChange,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  if (!priceChange) return null;
  const priceDifference = Number(priceChange.difference || 0);
  const hasIncrease = priceDifference > 0;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>Continue with new price?</h3>
        <p>
          The room price has changed from{" "}
          <strong>{formatCurrency(priceChange.oldFare)}</strong> to{" "}
          <strong>{formatCurrency(priceChange.newFare)}</strong>.
        </p>
        <p className={hasIncrease ? styles.priceIncrease : styles.priceDecrease}>
          {hasIncrease ? "Increase" : "Decrease"} amount:{" "}
          {formatCurrency(Math.abs(priceDifference))}
        </p>
        <p>
          We will redirect you to the payment page only after you accept this
          updated price.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            CANCEL
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "REDIRECTING..." : "CONTINUE WITH NEW PRICE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceChangeModal;
