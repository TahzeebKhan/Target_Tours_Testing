"use client";
import React from "react";
import styles from "./Switch.module.css";

export default function Switch({ checked, onChange, label }) {
  return (
    <label className={styles.wrapper}>
      {/* The Switch */}
      <div className={`${styles.switch} ${checked ? styles.active : ""}`}>
        <span className={styles.knob}></span>
      </div>

      {/* Hidden Accessible Input */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.hiddenInput}
      />

      {/* Label Text */}
      <span className={styles.label}>{label}</span>
    </label>
  );
}
