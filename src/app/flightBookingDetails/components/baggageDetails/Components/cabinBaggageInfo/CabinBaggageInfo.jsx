import React from "react";
import styles from "./CabinBaggageInfo.module.css";

const CabinBaggageInfo = () => {
  return (
    <div className={styles.wrapper}>
      {/* Left icon */}
      <div className={styles.iconBox}>
        <img
          src="/images/cabinBag.png"
          alt="Cabin Bag"
          className={styles.icon}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>1× Cabin Bag</h3>
          <span className={styles.included}>INCLUDED</span>
        </div>

        <ul className={styles.list}>
          <li>Stored in the overhead compartment</li>
          <li>
            Max weight: <strong>7 kg</strong>
          </li>
          <li>
            Max size: <strong>25 × 35 × 55 cm</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CabinBaggageInfo;
