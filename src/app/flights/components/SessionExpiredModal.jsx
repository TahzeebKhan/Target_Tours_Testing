"use client";

import styles from "./SessionExpiredModal.module.css";

export default function SessionExpiredModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fare-expired-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.icon}>!</div>
        <h2 id="fare-expired-title" className={styles.title}>
          Session Expired
        </h2>
        <p className={styles.message}>
          {message || "Fares expired please search again"}
        </p>
        <p className={styles.subText}>Refreshing fares with the same search details.</p>
        <button type="button" className={styles.button} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
