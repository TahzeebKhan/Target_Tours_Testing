"use client";

import Image from "next/image";
import styles from "./FlightNoResults.module.css";

const FlightNoResults = () => {
  return (
    <div className={styles.emptyState}>
      <Image
        src="/lottie/noplane.png"
        alt="No flight search results found"
        width={360}
        height={379}
        className={styles.image}
        priority={false}
      />
      <h3>No flights found</h3>
      <p>Try changing your dates, route, or filters.</p>
    </div>
  );
};

export default FlightNoResults;
