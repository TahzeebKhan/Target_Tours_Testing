"use client";
import { Cross, X } from "lucide-react";
import styles from "./DateCalendarModal.module.css";

export default function DateCalendarModal({
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
        {/* Header */}
        <div className={styles.header}>
          <h3>SET THE DATE</h3>

          {/* <button className={styles.close} onClick={onClose}>
            <X size={24} color="#1C1B1F" />
          </button> */}
          <div className={styles.toggle}>
            <button
              className={mode === "oneway" ? styles.active : ""}
            // onClick={() => onModeChange("oneway")}
            >
              ONE WAY
            </button>
            <button
              className={mode === "roundtrip" ? styles.active : ""}
            // onClick={() => onModeChange("roundtrip")}
            >
              ROUND TRIP
            </button>
          </div>
        </div>


        {/* Calendar Body */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
