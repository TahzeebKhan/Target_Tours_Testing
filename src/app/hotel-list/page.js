import React from "react";
import styles from "./layout.module.css";
import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
import TourListing from "./components/tourListing/TourListing";
import MapSection from "./components/mapSection/MapSection";


const HotelList = () => {
  return (
    <>
      {/* HERO SECTION (Image + Search) */}
      <TourHeroSection />

      {/* MAIN CONTENT */}
      <section className={styles.tourContent}>
        <div className={styles.tourLayout}>
          {/* LEFT: FILTERS */}
          <aside className={styles.tourFilters}>
          <TourListing/>
          </aside>

          {/* RIGHT: RESULTS GRID */}
          <div className={styles.tourResults}>
          <MapSection/>
          </div>
        </div>
      </section>
    </>
  );
};

export default HotelList;