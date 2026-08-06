"use client";
import Navbar from "./Navbar";
import styles from "./FlightsLayout.module.css";
import DatePriceSlider from "./components/DatePriceSlider";
import FlightFilters from "./components/FlightsFilters";
import TopFilterSection from "./components/TopFilterSection";
import { useEffect, useRef, useState } from "react";
import { TripTypeProvider, useTripType } from "./TripTypeContext";
import TopFilterResponsiveSec from "./components/TopFilterResponsiveSec";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { SidebarContext } from "./SidebarContext";
import { FlightFilterProvider } from "../context/FlightFilterContext";
import { Suspense } from "react";
import CustomLoaderHomePage from "@/shared/components/CustomLoaderHomePage";
import FlightEditFieldPopup from "@/shared/components/FlightPhoneViewPopup/FlightEditFieldPopup";

function LayoutContent({ children }) {
  const isMobile = useMediaQuery("(max-width: 430px)");
  const isTablet = useMediaQuery("(max-width: 1200px)");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { tripType } = useTripType();
  const containerRef = useRef(null);

  const sidebarRef = useRef(null);
  const navbarRef = useRef(null);
  const heroRef = useRef(null);
  const PAGE_PADDING_CONFIG = {
    default: {
      start: 291,
      end: 239,
    },
    multi: {
      start: 369,
      end: 318,
    },
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [stickyTop, setStickyTop] = useState(0);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOpecEditFields, setIsOpecEditFields] = useState(false);

  useEffect(() => {
    let ticking = false;
    const NAV_HEIGHT = 72;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const progress = Math.min(y / NAV_HEIGHT, 1); // 0 → 1
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial run

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMulti = tripType === "multi";

  const { start, end } = isMulti
    ? PAGE_PADDING_CONFIG.multi
    : PAGE_PADDING_CONFIG.default;

  const pagePaddingTop = start - (start - end) * scrollProgress;

  return (
    <>
      {" "}
      {/* Top Navbar */}
      <div className={styles.wrapper}>
        <div ref={navbarRef} className={``}></div>
        <div ref={heroRef} className={`${styles.imageBackgound} `}>
          <Navbar scrollProgress={scrollProgress} />

          <TopFilterSection
            isMobile={isMobile}
            scrollProgress={scrollProgress}
            setIsOpecEditFields={setIsOpecEditFields}
          />
        </div>
      </div>
      {/* Page Wrapper */}
      <main
        style={
          {
            // paddingTop: `${pagePaddingTop}px`,
          }
        }
        className={styles.page}
      >
        <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
          <div
            ref={containerRef}
            className={`${styles.container} ${tripType === "round"
                ? styles.wideContainer
                : styles.normalContainer
              }`}
          >
            {isTablet && (
              <button
                className={styles.sidebarToggle}
                onClick={() => setIsSidebarOpen((prev) => !prev)}
              >
                {isSidebarOpen ? "Hide Filters" : "Show Filters"}
              </button>
            )}
            {isTablet && isSidebarOpen && (
              <div
                className={styles.sidebarOverlay}
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            {/* Sidebar */}
            <aside
              className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed
                }`}
            >
              <div
                className={`${styles.sidebarSticky} ${tripType === "multi" ? styles.sidebarStickyMultiCity : ""
                  }`}
                ref={sidebarRef}
              >
                <FlightFilters />
              </div>
            </aside>

            {/* Main content */}
            <section className={styles.content}>{children}</section>
          </div>
        </SidebarContext.Provider>
      </main>
      {isOpecEditFields && (
        <FlightEditFieldPopup setIsOpecEditFields={setIsOpecEditFields} />
      )}
    </>
  );
}

export default function FlightsLayoutClient({ children }) {
  return (
    <FlightFilterProvider>
      <Suspense
        fallback={
          <div>
            <CustomLoaderHomePage />
          </div>
        }
      >
        <TripTypeProvider>
          <LayoutContent>{children}</LayoutContent>
        </TripTypeProvider>
      </Suspense>
    </FlightFilterProvider>
  );
}
