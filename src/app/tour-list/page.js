import React from "react";


import styles from "./layout.module.css";
import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
import FlightFilters from "./components/flightFilter/FlightsFilters";
import TourListing from "./components/tourListing/TourListing";

const ToursPage = () => {
  return (
    <>
      {/* HERO SECTION (Image + Search) */}
      <TourHeroSection />

      {/* MAIN CONTENT */}
      <section className={styles.tourContent}>
        <div className={styles.tourLayout}>
          {/* LEFT: FILTERS */}
          <aside className={styles.tourFilters}>
            <FlightFilters/>
          </aside>

          {/* RIGHT: RESULTS GRID */}
          <div className={styles.tourResults}>
            <TourListing/>
          </div>
        </div>
      </section>
    </>
  );
};

export default ToursPage;
