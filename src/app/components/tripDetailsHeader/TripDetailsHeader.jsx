import React from "react";
import styles from "./TripDetailsHeader.module.css";

const TripDetailsHeader = ({
  title = "Trip Details",
  onBack,
  children
}) => {
  return (
    <div className={styles.tripDetailsContainer}>
      <div className={styles.tripDetailsHeader}>
        <img
          src="/icons/leftArrowTrip.svg"
          alt="back"
          onClick={onBack}
          style={{ cursor: onBack ? "pointer" : "default" }}
        />

        {children ? (
          children
        ) : (
          <p className={styles.tripDetails}>{title}</p>
        )}
      </div>
    </div>
  );
};

export default TripDetailsHeader;
