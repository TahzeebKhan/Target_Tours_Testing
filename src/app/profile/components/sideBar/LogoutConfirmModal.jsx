"use client";
import Image from "next/image";
import styles from "./LogoutConfirmModal.module.css";
import { LogOut } from "lucide-react";

const LogoutConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <LogOut size={24} />
          </div>
        </div>

        <h3 className={styles.title}>Are you sure you want to Log Out?</h3>
        <div className={styles.br} />

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel{" "}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8L22 12L18 16"
                stroke="#DC2626"
                strokeLinecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12H22"
                stroke="#DC2626"
                strokeLinecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <button className={styles.logoutBtn} onClick={onConfirm}>
            Yes, Logout{" "}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8L22 12L18 16"
                stroke="white"
                strokeLinecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12H22"
                stroke="white"
                strokeLinecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
