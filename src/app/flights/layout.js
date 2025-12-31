"use client";
import Navbar from "./Navbar";
import styles from "./FlightsLayout.module.css";
import DatePriceSlider from "./components/DatePriceSlider";
import FlightFilters from "./components/FlightsFilters";
import TopFilterSection from "./components/TopFilterSection";
import { useEffect, useRef, useState } from "react";
import { TripTypeProvider, useTripType } from "./TripTypeContext";
import TopFilterResponsiveSec from "./components/TopFilterResponsiveSec";

function LayoutContent({ children }) {
  const { tripType } = useTripType();
  const containerRef = useRef(null);

  const sidebarRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);

  // const [scrolled, setScrolled] = useState(false);

  // useEffect(() => {
  //   const onScroll = () => {
  //     setScrolled(window.scrollY > 40); // 🔥 threshold
  //   };
  //   window.addEventListener("scroll", onScroll);
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, []);

  // Scroll detection for gap reduction
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY >= 100);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   handleScroll();

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 100);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  return () => window.removeEventListener("scroll", handleScroll);
}, []);



  return (
    <>
      {" "}
      {/* Top Navbar */}
      <div className={styles.wrapper}>
        <Navbar />
        <div className={`${styles.imageBackgound} ${isScrolled ? styles.hidden : ""}`}>
          <TopFilterSection />
        </div>
        <div className={`${styles.imageBackgoundRes} ${isScrolled ? styles.visible : ""}`}>
          <TopFilterResponsiveSec />
        </div>
      </div>
      {/* Page Wrapper */}
      <main className={styles.page}>
        <div
          ref={containerRef}
          className={`${styles.container} ${tripType === "round" ? styles.wideContainer : styles.normalContainer
            }`}
        >
          {/* top date slider */}
          {/* <div className={styles.dateSlider}>
            
          </div> */}
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
