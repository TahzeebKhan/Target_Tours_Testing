"use client";
import Navbar from "@/app/flights/Navbar";
import TravelInsuranceSearch from "../travelInsuranceSearch/TravelInsuranceSearch";
import styles from "./Navbar.module.css";
import { useState } from "react";
import BrandLogo from "@/shared/components/BrandLogo";
import Link from "next/link";

const TravelInsurance = ({ setMenuOpen }) => {
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

      <div className={styles.desktopNavbar}>
        <Navbar scrollProgress={scrollProgress} />
      </div>

      <div className={styles.mobileNavBar}>
        <div className={styles.navContainer}>
          <div className={styles.navbar}>
            <Link href="/" aria-label="Go to home">
              <BrandLogo fallbackSrc="/Logo.svg" alt="Target Tours Logo" />
            </Link>

            <div className={styles.navRight}>
              <button
                className={`${styles.glass_button} ${styles.downloadBtn}`}
              >
                Download the App
              </button>

              <button className={styles.signInBtn}>Sign In</button>

              <button
                onClick={() => setMenuOpen(true)}
                className={styles.hamBurger}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23.25 6H0.75C0.551088 6 0.360322 5.92098 0.21967 5.78033C0.0790176 5.63968 0 5.44891 0 5.25C0 5.05109 0.0790176 4.86032 0.21967 4.71967C0.360322 4.57902 0.551088 4.5 0.75 4.5H23.25C23.4489 4.5 23.6397 4.57902 23.7803 4.71967C23.921 4.86032 24 5.05109 24 5.25C24 5.44891 23.921 5.63968 23.7803 5.78033C23.6397 5.92098 23.4489 6 23.25 6Z"
                    fill="white"
                  />
                  <path
                    d="M23.25 13.5H0.75C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75C0 12.5511 0.0790176 12.3603 0.21967 12.2197C0.360322 12.079 0.551088 12 0.75 12H23.25C23.4489 12 23.6397 12.079 23.7803 12.2197C23.921 12.3603 24 12.5511 24 12.75C24 12.9489 23.921 13.1397 23.7803 13.2803C23.6397 13.421 23.4489 13.5 23.25 13.5Z"
                    fill="white"
                  />
                  <path
                    d="M23.25 21H0.75C0.551088 21 0.360322 20.921 0.21967 20.7803C0.0790176 20.6397 0 20.4489 0 20.25C0 20.0511 0.0790176 19.8603 0.21967 19.7197C0.360322 19.579 0.551088 19.5 0.75 19.5H23.25C23.4489 19.5 23.6397 19.579 23.7803 19.7197C23.921 19.8603 24 20.0511 24 20.25C24 20.4489 23.921 20.6397 23.7803 20.7803C23.6397 20.921 23.4489 21 23.25 21Z"
                    fill="white"
                  />
                </svg>

                <span>menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
