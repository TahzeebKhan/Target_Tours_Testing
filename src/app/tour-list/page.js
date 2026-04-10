"use client";
import React, { useState, Suspense, useEffect } from "react";
import styles from "./layout.module.css";
import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
import FlightFilters from "./components/flightFilter/FlightsFilters";
import TourListing from "./components/tourListing/TourListing";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { SidebarContext } from "./SidebarContext";
import { useSearchParams } from "next/navigation";

const ToursPage = () => {
  const isTablet = useMediaQuery("(max-width: 1156px)");
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const [filters, setFilters] = useState({})
  const [filters, setFilters] = useState({
    nights: [1, 10],
    price: [11307, 57295],
    flightType: null,
    packageType: null,
    premiumPackages: {},
    cities: {},
  });
  // const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [filterData, setFilterData] = useState(null); // 🔥 Store dynamic filter options from API
  const selectedCountry = searchParams.get("country") || "";

  const handleDataLoaded = (meta) => {
    if (meta?.counts) {
      setFilterData(meta.counts);
    }
  };

  const handleApplyFilters = (apiFilters) => {
    setPage(1);                // 🔥 pagination reset
    setFilters(apiFilters);    // 🔥 single source
  };


  useEffect(() => {
    const apiFilters = {};

    if (Array.isArray(filters.nights)) {
      apiFilters.min_nights = filters.nights[0];
      apiFilters.max_nights = filters.nights[1];
    }

    if (Array.isArray(filters.price)) {
      apiFilters.min_price = filters.price[0];
      apiFilters.max_price = filters.price[1];
    }

    if (filters.flightType === "with") apiFilters.with_flight = true;
    if (filters.flightType === "without") apiFilters.with_flight = false;

    if (filters.packageType) {
      apiFilters.package_type = filters.packageType;
    }

    if (filters.premiumPackages?.Premium) {
      apiFilters.is_premium_package = true;
    }

    const cities = Object.keys(filters.cities || {}).filter(
      (c) => filters.cities[c]
    );
    if (cities.length) {
      apiFilters.city = cities.join(",");
    }

    // ❌ NO onApply here
  }, [filters]);



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
            </aside>

            {/* RESULTS */}
            <div className={styles.tourResults}>
              <TourListing
                filters={{
                  ...filters,
                  country: selectedCountry,
                }}
                page={page}
                setPage={setPage}
                onDataLoaded={handleDataLoaded} // 🔥 Receive data
              />
            </div>

          </div>
        </SidebarContext.Provider>
      </section>
    </>
  );
};

export default ToursPage;
