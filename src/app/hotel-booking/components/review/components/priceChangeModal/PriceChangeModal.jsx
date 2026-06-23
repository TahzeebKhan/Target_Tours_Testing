"use client";

import React from "react";
import styles from "./PriceChangeModal.module.css";

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const PriceChangeModal = ({
  priceChange,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  if (!priceChange) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>Price Changed</h3>
        <p>
          The room price has increased from{" "}
          <strong>{formatCurrency(priceChange.oldFare)}</strong> to{" "}
          <strong>{formatCurrency(priceChange.newFare)}</strong>.
        </p>
        <p className={styles.priceIncrease}>
          Increase amount: {formatCurrency(priceChange.difference)}
        </p>
        <p>Do you want to confirm your booking with the new price?</p>
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
            {loading ? "CONFIRMING..." : "CONFIRM"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceChangeModal;
