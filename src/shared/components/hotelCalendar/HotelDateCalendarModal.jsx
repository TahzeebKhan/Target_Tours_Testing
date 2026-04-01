"use client";
import { Cross, X } from "lucide-react";
import styles from "./HotelDateCalendarModal.module.css";

export default function HotelDateCalendarModal({
  mode, // "oneway" | "roundtrip"
  onModeChange,
  onClose,
  children,
  anchorEl,
}) {
  const rect = anchorEl?.getBoundingClientRect();

  const style = rect
    ? {
      position: "absolute",
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      zIndex: 9999,
    }
    : {};

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={style}>
        

        {/* Calendar Body */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
