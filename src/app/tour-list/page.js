// "use client"
// import React, { useState } from "react";

// import styles from "./layout.module.css";
// import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
// import FlightFilters from "./components/flightFilter/FlightsFilters";
// import TourListing from "./components/tourListing/TourListing";

// const ToursPage = () => {
//   return (
//     <>
//       {/* HERO SECTION (Image + Search) */}
//       <TourHeroSection />

//       {/* MAIN CONTENT */}
//       <section className={styles.tourContent}>
//         <div className={styles.tourLayout}>
//           {/* LEFT: FILTERS */}
//           <aside className={styles.tourFilters}>
//             <FlightFilters/>
//           </aside>

//           {/* RIGHT: RESULTS GRID */}
//           <div className={styles.tourResults}>
//             <TourListing/>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default ToursPage;

"use client";
import React, { useState, Suspense } from "react";
import styles from "./layout.module.css";
import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
import FlightFilters from "./components/flightFilter/FlightsFilters";
import TourListing from "./components/tourListing/TourListing";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { SidebarContext } from "./SidebarContext";

const ToursPage = () => {
  const isTablet = useMediaQuery("(max-width: 1156px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* HERO SECTION */}
      <Suspense fallback={<div>Loading...</div>}>
        <TourHeroSection />
      </Suspense>

      {/* MAIN CONTENT */}
      <section className={styles.tourContent}>
        <SidebarContext.Provider
          value={{ isSidebarOpen, setIsSidebarOpen, isTablet }}
        >
          <div className={styles.tourLayout}>
            {/* TOGGLE BUTTON (Tablet & below) */}



            {/* OVERLAY */}
            {isTablet && isSidebarOpen && (
              <div
                className={styles.sidebarOverlay}
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* FILTERS */}
            <aside
              className={`${styles.tourFilters} ${isSidebarOpen
                ? styles.sidebarOpen
                : styles.sidebarCollapsed
                }`}
            >
              <FlightFilters />
            </aside>

            {/* RESULTS */}
            <div className={styles.tourResults}>
              <TourListing />
            </div>

          </div>
        </SidebarContext.Provider>
      </section>
    </>
  );
};

export default ToursPage;
