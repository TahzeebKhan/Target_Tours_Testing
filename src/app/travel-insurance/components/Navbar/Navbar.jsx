"use client";
import TravelInsuranceSearch from "../travelInsuranceSearch/TravelInsuranceSearch";
import styles from "./Navbar.module.css";

const Navbar = () => {
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
      <img
        className={styles.gradient}
        src="/images/gradient.png"
        alt=""
      />

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
          <h1>All your travel worries, taken care of.</h1>
          <p>
            Travel with confidence knowing we’ve got you covered—from medical emergencies to trip disruptions.
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

export default Navbar;
