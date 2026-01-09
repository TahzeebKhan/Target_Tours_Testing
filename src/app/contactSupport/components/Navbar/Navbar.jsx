"use client";
import { useState } from "react";
import Image from "next/image";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const [activeTopic, setActiveTopic] = useState("");
  return (
    <header className={styles.homeSection}>
      {/* HERO VIDEO */}
      <video
        className={styles.heroVideo}
        src="/videos/support.mp4"
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* DARK OVERLAY */}
      <div className={styles.overlay}></div>

      {/* GRADIENT OVERLAY */}
      <img className={styles.gradient} src="/images/gradient.png" alt="" />

      {/* NAVBAR */}
      <div className={styles.navContainer}>
        <div className={styles.navbar}>
          <img src="/Logo.svg" alt="Logo" />

          <div className={styles.navRight}>
            <button className={`${styles.glass_button} ${styles.downloadBtn}`}>
              Download the App
            </button>

            <button className={styles.signInBtn}>Sign In</button>

            <button className={styles.hamBurger}>
              <img src="/icons/hamBurger.png" alt="menu" />
              menu
            </button>
          </div>
        </div>
      </div>

      {/* HERO CONTENT */}
      <div className={styles.homePageContainer}>
        <div className={styles.InspiredSection}>
          <h1>How Can We Help You?</h1>
          <p>
            Travel with confidence knowing we’ve got you covered—from medical
            emergencies to trip disruptions.
          </p>
          {/* SEARCH BAR */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchBox}>
              <div className={styles.searchIcon}>
                <Image
                  src="/icons/search-icon.svg"
                  alt="Search"
                  width={20}
                  height={20}
                />
              </div>

              <input
                type="text"
                placeholder="Search for help topics, booking issues, payment questions..."
                className={styles.searchInput}
              />
            </div>

            <button className={styles.searchBtn} aria-label="Search">
              <Image
                src="/icons/search-icon.svg"
                alt="Search"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>

        {/* POPULAR TOPICS */}
        <div className={styles.popularTopics}>
          <span className={styles.popularLabel}>POPULAR TOPICS:</span>

          <div className={styles.topicList}>
            {[
              "Cancel booking",
              "Refund status",
              "Change flight",
              "Update details",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setActiveTopic(item)}
                className={`${styles.topicItem} ${
                  activeTopic === item ? styles.active : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
