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

const VISA_SOLUTION_FEATURES = [
  {
    title: "Global Reach",
    text: "Get visa assistance for 100+ countries, handled by experts who know every destination's requirements.",
  },
  {
    title: "High Approval Rate",
    text: "Years of expertise and accurate documentation help maximize your chances of visa approval.",
  },
  {
    title: "Quick Turnaround",
    text: "Skip the long waits with our streamlined process and real-time application tracking.",
  },
  {
    title: "Data Security",
    text: "Your personal documents and information stay fully protected throughout the process.",
  },
];

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
      <section className={styles.visaSolutions}>
        <div className={styles.visaSolutionsOverlay} />
        <div className={styles.visaSolutionsInner}>
          <div className={styles.visaSolutionsIntro}>
            <p className={styles.visaSolutionsEyebrow}>
              Life, well-travelled since 1993
            </p>
            <h2 className={styles.visaSolutionsTitle}>
              Hassle-Free Visa Solutions
            </h2>
          </div>

          <div className={styles.visaSolutionsFeatures}>
            {VISA_SOLUTION_FEATURES.map((feature) => (
              <div className={styles.visaSolutionsFeature} key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>

          <div className={styles.visaSolutionsFooter}>
            <img src="/images/footerIcon.png" alt="Target Tours" />
            <p>
              Travel isn't just about reaching a destination - it's about
              discovering new worlds, new perspectives, and new parts of
              yourself. At Target Tours, we don't just plan trips; we craft
              unforgettable journeys designed to match your dreams.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default VisaPage;
