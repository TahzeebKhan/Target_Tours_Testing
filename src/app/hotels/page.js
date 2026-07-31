
"use client"
import React, { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./layout.module.css";
import TourHeroSection from "./components/tourHeroSection.js/TourHeroSection";
import TourListing from "./components/TourListing";

import MobileHotelDetails from "./components/mobileView/MobileHotelDetails";
import HotelsFilters from "./components/HotelsFilters"
import { HotelsProvider } from "./context/HotelsContext";
import { HOTEL_LAST_SEARCH_URL_KEY } from "@/shared/services/hotelSearch";

const RestoreHotelSearchUrl = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.toString() || typeof window === "undefined") return;

    try {
      const lastSearchUrl = window.localStorage.getItem(HOTEL_LAST_SEARCH_URL_KEY);
      if (lastSearchUrl?.startsWith("/hotels?")) {
        router.replace(lastSearchUrl);
      }
    } catch {
      // Ignore storage failures.
    }
  }, [router, searchParams]);

  return null;
};

const HotelListContent = () => {
  const filtersRef = useRef(null);

  useEffect(() => {
    const filters = filtersRef.current;
    if (!filters) return;

    const updateStickyOffset = () => {
      const stickyTop = Math.min(
        0,
        window.innerHeight - filters.offsetHeight,
      );
      filters.style.setProperty("--filters-sticky-top", `${stickyTop}px`);
    };

    const resizeObserver = new ResizeObserver(updateStickyOffset);
    resizeObserver.observe(filters);
    window.addEventListener("resize", updateStickyOffset);
    updateStickyOffset();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateStickyOffset);
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RestoreHotelSearchUrl />
      </Suspense>
      {/* HERO SECTION (Image + Search) */}
      <div className={styles.tourListSectionWrappper}>
        <Suspense fallback={<div>Loading...</div>}>
          <TourHeroSection resultsPath="/hotels" />
        </Suspense>

        {/* MAIN CONTENT */}
        <section className={styles.tourContent}>
          <div className={styles.tourLayout}>
            {/* LEFT: FILTERS */}
            <aside className={styles.tourFilters} ref={filtersRef}>
              <Suspense fallback={null}>
                <HotelsFilters />
              </Suspense>
            </aside>

            {/* RIGHT: RESULTS GRID */}
            <div className={styles.tourResults}>
              <Suspense fallback={null}>
                <TourListing />
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

const HotelList = () => (
  <HotelsProvider>
    <HotelListContent />
  </HotelsProvider>
);

export default HotelList;
