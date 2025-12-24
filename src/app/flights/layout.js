"use client";
import Navbar from "./Navbar";
import styles from "./FlightsLayout.module.css";
import DatePriceSlider from "./components/DatePriceSlider";
import FlightFilters from "./components/FlightsFilters";
import TopFilterSection from "./components/TopFilterSection";
import { useEffect, useRef, useState } from "react";
import { TripTypeProvider, useTripType } from "./TripTypeContext";

function LayoutContent({ children }) {
  const { tripType } = useTripType();
  const containerRef = useRef(null);

  const sidebarRef = useRef(null);


  return (
    <>
      {" "}
      {/* Top Navbar */}
      <div className={styles.wrapper}>
        <Navbar />
        <div className={styles.imageBackgound}>
          <TopFilterSection />
        </div>
      </div>
      {/* Page Wrapper */}
      <main className={styles.page}>
        <div
          ref={containerRef}
          className={`${styles.container} ${
            tripType === "round" ? styles.wideContainer : styles.normalContainer
          }`}
        >
          {/* top date slider */}
          <div className={styles.dateSlider}>
            <DatePriceSlider />
          </div>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky} ref={sidebarRef}>
              <FlightFilters />
            </div>
          </aside>

          {/* Main content */}
          <section className={styles.content}>{children}</section>
        </div>
      </main>
    </>
  );
}

export default function FlightsLayout({ children }) {
  return (
    <TripTypeProvider>
      <LayoutContent>{children}</LayoutContent>
    </TripTypeProvider>
  );
}
