"use client";
import Navbar from "./Navbar";
import styles from "./FlightsLayout.module.css";
import DatePriceSlider from "./components/DatePriceSlider";
import FlightFilters from "./components/FlightsFilters";
import TopFilterSection from "./components/TopFilterSection";
import { useState } from "react";
import { TripTypeProvider } from "./TripTypeContext";

export default function FlightsLayout({ children }) {
  // const [tripType, setTripType] = useState("oneway");
  return (
    <>
      <TripTypeProvider>
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
          <div className={styles.container}>
            {/* top date slider */}
            <div className={styles.dateSlider}>
              <DatePriceSlider />
            </div>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <FlightFilters />
            </aside>

            {/* Main content */}
            <section className={styles.content}>{children}</section>
          </div>
        </main>
      </TripTypeProvider>
    </>
  );
}
