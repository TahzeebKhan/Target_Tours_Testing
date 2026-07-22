"use client";

import Image from "next/image";
import styles from "./CustomLoaderHomePage.module.css";

const CustomLoaderHomePage = () => {
  return (
    <div className={styles.loaderWrapper}>
      {/* Center Logo */}
      <div className={styles.centerContent}>
        <Image
          src="/images/logoLoader.webp" // replace with your logo
          alt="Target Tours"
          width={227}
          height={191}
          priority
        />
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomContent}>
        <div className={styles.spinner}></div>

        <h3 className={styles.title}>TODAY’S TRAVEL INSPIRATION</h3>
        <p className={styles.subtitle}>
          “Travel isn’t always about the destination — it’s about the stories
          you collect along the way.”
        </p>
      </div>
    </div>
  );
};

export default CustomLoaderHomePage;
