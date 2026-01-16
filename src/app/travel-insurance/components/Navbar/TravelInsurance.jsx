"use client";
import Navbar from "@/app/flights/Navbar";
import TravelInsuranceSearch from "../travelInsuranceSearch/TravelInsuranceSearch";
import styles from "./Navbar.module.css";
import { useState } from "react";

const TravelInsurance = () => {
   const [scrollProgress, setScrollProgress] = useState(0);
  return (
    <header className={styles.homeSection}>
      {/* HERO VIDEO */}
      <video
        className={styles.heroVideo}
        src="/videos/travel-insurance.mp4"
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
      {/* <div className={styles.navContainer}>
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
      </div> */}
      <Navbar scrollProgress={scrollProgress}/>


      {/* HERO CONTENT */}
      <div className={styles.homePageContainer}>
        <div className={styles.InspiredSection}>
          <h1 className={styles.heroTitleMain}>
            All your travel worries, taken care of.
          </h1>

          <h1 className={styles.heroTitleSub}>
            <span className={styles.line}>All your travel</span>
            <span className={styles.line}>worries,</span>
            <span className={styles.line}>taken care of.</span>
          </h1>

          <p>
            Travel with confidence knowing we’ve got you covered—from medical
            emergencies to trip disruptions.
          </p>
          <div className={styles.plans}>
            Plans starting at just ₹65/day with tax
          </div>
        </div>

        <TravelInsuranceSearch />
      </div>
    </header>
  );
};

export default TravelInsurance;
