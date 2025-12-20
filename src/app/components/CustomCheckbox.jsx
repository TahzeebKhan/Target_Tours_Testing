import React from "react";
import styles from "./CustomCheckbox.module.css";

const CustomCheckbox = ({ label, checked, onChange }) => {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.customCheckbox}>
        <span className={styles.checkIcon}></span>
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default CustomCheckbox;
