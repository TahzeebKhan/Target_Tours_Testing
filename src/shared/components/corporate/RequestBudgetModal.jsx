"use client";

import { X, Upload } from "lucide-react";
import styles from "./RequestBudgetModal.module.css";

const RequestBudgetModal = ({ remainingBudget, onClose }) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Request Additional Budget</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Current Budget */}
        <div className={styles.currentBudget}>
          <span>Current Remaining Budget</span>
          <strong>₹ {remainingBudget}</strong>
        </div>

        {/* Form */}
        <div className={styles.form}>
          <div className={styles.field}>
            <label>REQUESTED ADDITIONAL BUDGET *</label>
            <input type="number" placeholder="₹ Enter Amount" />
          </div>

          <div className={styles.field}>
            <label>REASON FOR REQUEST *</label>
            <textarea placeholder="Please Provide a Detailed Reason For The Additional Budget Request..." />
          </div>
          <div className={styles.field}>
            {" "}
            <label>Supporting Document (Optional)</label>
            <div className={styles.uploadBox}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M28 20V25.3333C28 26.0406 27.719 26.7189 27.219 27.219C26.7189 27.719 26.0406 28 25.3333 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V20"
                  stroke="#7B8799"
                  strokeWidth="2.66667"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M22.6673 10.6667L16.0007 4L9.33398 10.6667"
                  stroke="#7B8799"
                  strokeWidth="2.66667"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 4V20"
                  stroke="#7B8799"
                  strokeWidth="2.66667"
                  strokeLinecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <p>Click to upload or drag and drop</p>
              <span>PDF, DOC, or image (max 10MB)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            CANCEL REQUEST
          </button>
          <button className={styles.confirm}>SUBMIT REQUEST</button>
        </div>
      </div>
    </div>
  );
};

export default RequestBudgetModal;
