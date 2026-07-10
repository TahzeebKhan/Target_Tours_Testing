"use client";
import React, { useState, Suspense } from "react";
import styles from "./layout.module.css";
import VisaHeroSection from "./components/VisaHeroSection.js/VisaHeroSection";
import VisaDestination from "./components/visaDestination";
// import FlightFilters from "./components/flightFilter/FlightsFilters";
// import TourListing from "./components/tourListing/TourListing";
import { useMediaQuery } from "../hooks/useMediaQuery";
// import { SidebarContext } from "./SidebarContext";
import { useSearchParams } from "next/navigation";
import VisaCarousel from "./components/component/VisaCarousel";
import VisaStep from "./components/component/VisaStep";
import Footer from "../home-page/components/footer/Footer";
const VisaPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisaPageContent />
    </Suspense>
  );
};

const VisaPageContent = () => {
  const isTablet = useMediaQuery("(max-width: 1156px)");
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const selectedCountry = searchParams.get("country") || "";
  const selectedFrom = searchParams.get("from") || "";
  const selectedTo = searchParams.get("to") || "";
  const selectedThemes = searchParams.get("themes") || "";
  const selectedPackageType = searchParams.get("package_type") || "";

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [filterData, setFilterData] = useState(null); // 🔥 Store dynamic filter options from API
  const handleDataLoaded = (meta) => {
    if (meta?.counts) {
      setFilterData(meta.counts);
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <Suspense fallback={<div>Loading...</div>}>
        <VisaHeroSection />
      </Suspense>
      <VisaDestination />
      <VisaCarousel/>
      <VisaStep />

      {/* MAIN CONTENT */}
      <section className={styles.tourContent}>
        {/* <SidebarContext.Provider
          value={{ isSidebarOpen, setIsSidebarOpen, isTablet }}
        > */}
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
            {/* <aside
              className={`${styles.tourFilters} ${isSidebarOpen
                ? styles.sidebarOpen
                : styles.sidebarCollapsed
                }`}
            >
              <FlightFilters
                filterData={filterData} // 🔥 Pass dynamic data
                onApply={(apiFilters) => {
                  setFilters(apiFilters)
                  setPage(1)
                }}
                // onApply={handleApplyFilters}
                onReset={() => {
                  setFilters({});
                  setPage(1);
                }}
              />
            </aside> */}

            {/* RESULTS */}
            <div className={styles.tourResults}>
              {/* <TourListing
                filters={{
                  ...filters,
                  country: selectedCountry,
                  from: selectedFrom,
                  to: selectedTo,
                  themes: selectedThemes,
                  package_type: selectedPackageType,
                }}
                page={page}
                setPage={setPage}
                onDataLoaded={handleDataLoaded} // 🔥 Receive data
              /> */}
            </div>

          </div>
        {/* </SidebarContext.Provider> */}
      </section>
      <Footer />
    </>
  );
};

export default VisaPage;
