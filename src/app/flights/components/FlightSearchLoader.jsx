"use client";

import Lottie from "lottie-react";
import styles from "./FlightSearchLoader.module.css";
import animationData from "./flightSearchLoader/flight-loader.json";

const FlightSearchLoader = ({ message = "Searching flights" }) => {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <div className={styles.animationWrap}>
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className={styles.animation}
        />
      </div>
      <p>{message}</p>
    </div>
  );
};

export default FlightSearchLoader;
