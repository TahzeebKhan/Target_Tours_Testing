import React, { Suspense } from "react";
import styles from "./layout.module.css";
import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
import TourListing from "./components/tourListing/TourListing";
import MapSection from "./components/mapSection/MapSection";
import MobileHotelDetails from "./components/mobileView/MobileHotelDetails";


const HotelList = () => {
  return (
    <>
      {/* HERO SECTION (Image + Search) */}
      <div className={styles.tourListSectionWrappper}>
        <Suspense fallback={<div>Loading...</div>}>
          <TourHeroSection />
        </Suspense>

        {/* MAIN CONTENT */}
        <section className={styles.tourContent}>
          <div className={styles.tourLayout}>
            {/* LEFT: FILTERS */}
            <aside className={styles.tourFilters}>
              <Suspense fallback={null}>
                <TourListing />
              </Suspense>
            </aside>

            {/* RIGHT: RESULTS GRID */}
            <div className={styles.tourResults}>
              <Suspense fallback={null}>
                <MapSection />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
      <div className={styles.tourListSectionMobileView}>
        <Suspense fallback={null}>
          <MobileHotelDetails />
        </Suspense>
      </div>
    </>
  );
};

export default HotelList;
