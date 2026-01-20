"use client";
import React, { useEffect } from "react";
import styles from "./CreateWishlistModal.module.css";
import { X } from "lucide-react";

const CreateWishlistModal = ({ onClose }) => {
  // prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Bottom Sheet */}
      <div className={styles.modal}>
        <div className={styles.header}>
          <h4>Create Wishlist</h4>
          <button className={styles.closeBtn} onClick={onClose}>
            <X color="#18181B" size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <label className={styles.label}>WISHLIST NAME</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter new wishlist name"
          />
        </div>

        <button className={styles.doneBtn}>
          Done{" "}
          <span>
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
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12H22"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
};

export default CreateWishlistModal;
