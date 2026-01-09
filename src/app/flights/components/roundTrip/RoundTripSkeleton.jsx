"use client";
import React from "react";
import styles from "./RoundTripSkeleton.module.css";

const SkeletonCard = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardDiv}>
        <div className={styles.row}>
          <div className={styles.leftBlock}>
            <div className={styles.logo} />
            <div className={styles.textBlock}>
              <div className={styles.lineShort} />
              <div className={styles.lineTiny} />
            </div>
          </div>

          <div className={styles.rightBlock}>
            <div className={`${styles.textBlock} ${styles.textBlockRight}`}>
              <div className={styles.lineShort} />
              <div className={styles.lineTiny} />
            </div>
            <div className={styles.logo} />
          </div>
        </div>

        {/* ROW 2 */}
        <div className={styles.row}>
          <div className={styles.lineLong} />
          <div className={styles.lineMedium} />
        </div>
      </div>
      <div className={styles.seperator}/>
      <div className={styles.cardDiv}>
        <div className={styles.row}>
          <div className={styles.leftBlock}>
            <div className={styles.logo} />
            <div className={styles.textBlock}>
              <div className={styles.lineShort} />
              <div className={styles.lineTiny} />
            </div>
          </div>

          <div className={styles.rightBlock}>
            <div className={`${styles.textBlock} ${styles.textBlockRight}`}>
              <div className={styles.lineShort} />
              <div className={styles.lineTiny} />
            </div>
            <div className={styles.logo} />
          </div>
        </div>

        {/* ROW 2 */}
        <div className={styles.row}>
          <div className={styles.lineLong} />
          <div className={styles.lineMedium} />
        </div>
      </div>
    </div>
  );
};

const RoundTripSkeleton = () => {
  return (
    <div className={styles.wrapper}>
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default RoundTripSkeleton;
