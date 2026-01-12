"use client";
import { BaggageClaim, UserIcon } from "lucide-react";
import styles from "./ProfileModal.module.css";
import { useRouter } from "next/navigation";

export default function ProfileModal({ userEmail, onClose }) {
  const router = useRouter();
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.email}>{"Hi, "}</p>
          <p className={styles.subText}>{userEmail}</p>
        </div>

        {/* Options */}
        <div
          onClick={() => {
            router.push("profile");
          }}
          className={styles.option}
        >
          <span className={styles.icon}>
            <UserIcon />
          </span>
          <div>
            <p className={styles.title}>My Profile</p>
            <p className={styles.desc}>
              Manage your profile, traveller details, login details and password
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            router.push("profile?my-trips=true");
          }}
          className={styles.option}
        >
          <span className={styles.icon}>
            <BaggageClaim />
          </span>
          <div>
            <p className={styles.title}>My Trips</p>
            <p className={styles.desc}>
              See booking details, print e-ticket, cancel booking, modify
              booking and check refund status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
