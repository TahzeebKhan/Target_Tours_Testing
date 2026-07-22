"use client";
import styles from "./ProfileModal.module.css";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState } from "react";

export default function ProfileModal({ anchorRef, onClose }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useLayoutEffect(() => {
    if (!anchorRef?.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();

      setStyle({
        position: "fixed",
        top: "73px", // spacing under button
        left: Math.min(rect.right - 253, window.innerWidth - 253 - 16),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.option}
          onClick={() => {
            router.push("/profile");
            onClose();
          }}
        >
          <p className={styles.title}>My Profile</p>
          <p className={styles.desc}>
            Manage your personal details, traveller information, login
            credentials, and password.
          </p>
        </div>

        <div
          className={styles.option}
          onClick={() => {
            router.push("/profile?my-trips=true");
            onClose();
          }}
        >
          <p className={styles.title}>My Trips</p>
          <p className={styles.desc}>View and manage your bookings</p>
        </div>
        <div
          className={styles.option}
          onClick={() => {
            router.push("/profile?settings=true");
            onClose();
          }}
        >
          <p className={styles.title}>My Settings</p>
          <p className={styles.desc}>
            Control your preferences, notifications, language, and account
            security options.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
