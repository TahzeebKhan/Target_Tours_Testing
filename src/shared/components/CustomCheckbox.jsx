import React from "react";
import styles from "./CustomCheckbox.module.css";

const CustomCheckbox = ({
  labelStyle,
  alignItemsStart,
  labelColor,
  gap = 6,
  label,
  checked,
  onChange,
}) => {
  return (
    <label style={gap ? { gap: gap } : {}} className={`${styles.checkbox} ${alignItemsStart ?styles.itemsStart:"" }`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.customCheckbox}>
        <span className={styles.checkIcon}></span>
      </span>
      <span
        className={styles.label}
        style={{
          color: labelColor,
          ...(labelStyle || {}),
        }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </label>
  );
};

export default CustomCheckbox;
