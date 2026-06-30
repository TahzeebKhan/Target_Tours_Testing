
"use client"
import React, { Suspense, useCallback, useState } from "react";
import styles from "./layout.module.css";
import TourHeroSection from "../hotel-list/components/tourHeroSection.js/TourHeroSection";
import TourListing from "./components/TourListing";

import MobileHotelDetails from "../hotel-list/components/mobileView/MobileHotelDetails";
import HotelsFilters from "./components/HotelsFilters"

const HotelList = () => {
  const [filterData, setFilterData] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});

  const handleDataLoaded = useCallback((meta) => {
    if (meta?.counts) {
      setFilterData(meta.counts);
    }
  }, []);

  return (
    <>
      {/* HERO SECTION (Image + Search) */}
      <div className={styles.tourListSectionWrappper}>
        <Suspense fallback={<div>Loading...</div>}>
          <TourHeroSection resultsPath="/hotels" />
        </Suspense>

        {/* MAIN CONTENT */}
        <section className={styles.tourContent}>
          <div className={styles.tourLayout}>
            {/* LEFT: FILTERS */}
            <aside className={styles.tourFilters}>
              <Suspense fallback={null}>
                <HotelsFilters
                  filterData={filterData}
                  onApply={setAppliedFilters}
                  onReset={() => setAppliedFilters({})}
                />
              </Suspense>
            </aside>

            {/* RIGHT: RESULTS GRID */}
            <div className={styles.tourResults}>
              <Suspense fallback={null}>
                <TourListing
                  activeFilters={appliedFilters}
                  onDataLoaded={handleDataLoaded}
                />
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
