"use client";

import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import styles from "./SessionExpiredModal.module.css";

export default function SessionExpiredModal({
  isOpen,
  message,
  subText = "Refreshing fares with the same search details.",
  actionLabel = "OK",
  onClose,
}) {
  useLockBodyScroll(isOpen);

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
        {subText ? <p className={styles.subText}>{subText}</p> : null}
        <button type="button" className={styles.button} onClick={onClose}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
