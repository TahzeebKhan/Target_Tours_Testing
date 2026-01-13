// "use client";
// import Navbar from "./Navbar";
// import styles from "./FlightsLayout.module.css";
// import DatePriceSlider from "./components/DatePriceSlider";
// import FlightFilters from "./components/FlightsFilters";
// import TopFilterSection from "./components/TopFilterSection";
// import { useEffect, useRef, useState } from "react";
// import { TripTypeProvider, useTripType } from "./TripTypeContext";
// import TopFilterResponsiveSec from "./components/TopFilterResponsiveSec";

// function LayoutContent({ children }) {
//   const { tripType } = useTripType();
//   const containerRef = useRef(null);

//   const sidebarRef = useRef(null);
//   const navbarRef = useRef(null);

//   const [isScrolled, setIsScrolled] = useState(false);
//   const [stickyTop, setStickyTop] = useState(0);

//   // const [scrolled, setScrolled] = useState(false);

//   // useEffect(() => {
//   //   const onScroll = () => {
//   //     setScrolled(window.scrollY > 40); // 🔥 threshold
//   //   };
//   //   window.addEventListener("scroll", onScroll);
//   //   return () => window.removeEventListener("scroll", onScroll);
//   // }, []);

//   // Scroll detection for gap reduction
//   // useEffect(() => {
//   //   const handleScroll = () => {
//   //     setIsScrolled(window.scrollY >= 100);
//   //   };

//   //   window.addEventListener("scroll", handleScroll);
//   //   handleScroll();

//   //   return () => window.removeEventListener("scroll", handleScroll);
//   // }, []);

//   useEffect(() => {
//   let ticking = false;

//   const updateOffsets = () => {
//     if (!ticking) {
//       window.requestAnimationFrame(() => {
//         const scrolled = window.scrollY > 100;
//         setIsScrolled(scrolled);

//         const navRect = navbarRef.current?.getBoundingClientRect();
//         // if navbar is visible (bottom > 0) keep its bottom as offset, otherwise stick to top
//         const topOffset = navRect ? Math.max(0, Math.ceil(Math.min(navRect.bottom, navRect.height))) : 0;
//         setStickyTop(scrolled ? topOffset : 0);

//         ticking = false;
//       });
//       ticking = true;
//     }
//   };

//   window.addEventListener("scroll", updateOffsets, { passive: true });
//   window.addEventListener("resize", updateOffsets);
//   updateOffsets();

//   return () => {
//     window.removeEventListener("scroll", updateOffsets);
//     window.removeEventListener("resize", updateOffsets);
//   };
// }, []);

//   return (
//     <>
//       {" "}
//       {/* Top Navbar */}
//       <div className={styles.wrapper}>
//         <div ref={navbarRef}>
//           <Navbar />
//         </div>
//         <div
//           className={`${styles.imageBackgound} ${isScrolled ? styles.sticky : ""}`}
//           style={isScrolled ? { top: `${stickyTop}px` } : undefined}
//         >
//           <TopFilterSection isScrolled={isScrolled} />
//         </div>
//         {isScrolled && (
//           <div
//             className={styles.imageSpacer}
//             aria-hidden="true"
//             style={{ height: "147px" }}
//           />
//         )}
//         {/* <div className={`${styles.imageBackgoundRes} ${isScrolled ? styles.visible : ""}`}>
//           <TopFilterResponsiveSec />
//         </div> */}
//       </div>
//       {/* Page Wrapper */}
//       <main className={styles.page}>
//         <div
//           ref={containerRef}
//           className={`${styles.container} ${tripType === "round" ? styles.wideContainer : styles.normalContainer
//             }`}
//         >
//           {/* top date slider */}
//           {/* <div className={styles.dateSlider}>

//           </div> */}
//           {/* Sidebar */}
//           <aside className={styles.sidebar}>
//             <div className={styles.sidebarSticky} ref={sidebarRef}>
//               <FlightFilters />
//             </div>
//           </aside>

//           {/* Main content */}
//           <section className={styles.content}>{children}</section>
//         </div>
//       </main>
//     </>
//   );
// }

// export default function FlightsLayout({ children }) {
//   return (
//     <TripTypeProvider>
//       <LayoutContent>{children}</LayoutContent>
//     </TripTypeProvider>
//   );
// }

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

  //   useEffect(() => {
  //   let ticking = false;

  //   const updateOffsets = () => {
  //     if (!ticking) {
  //       window.requestAnimationFrame(() => {
  //         const scrolled = window.scrollY > 100;
  //         setIsScrolled(scrolled);

  //         const navRect = navbarRef.current?.getBoundingClientRect();
  //         // if navbar is visible (bottom > 0) keep its bottom as offset, otherwise stick to top
  //         const topOffset = navRect ? Math.max(0, Math.ceil(Math.min(navRect.bottom, navRect.height))) : 0;
  //         setStickyTop(scrolled ? topOffset : 0);

  //         ticking = false;
  //       });
  //       ticking = true;
  //     }
  //   };

  //   const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  //   window.addEventListener("scroll", updateOffsets, { passive: true });
  //   window.addEventListener("resize", updateOffsets);

  //   // smooth shrink calculation: 0 -> not shrunk, 1 -> fully shrunk
  //   const setShrink = () => {
  //     const hero = heroRef.current;
  //     if (!hero) return;
  //     const maxH = 290; // match CSS default
  //     const minH = 147; // desired compact height
  //     const threshold = 220; // px over which shrink happens
  //     const progress = clamp(window.scrollY / threshold, 0, 1);
  //     // write as unitless 0..1
  //     hero.style.setProperty("--shrink", String(progress));

  //     // if using spacer keep it in sync (only if spacer present)
  //     // const spacer = document.querySelector(`.${styles.imageSpacer}`);
  //     // if (spacer) spacer.style.height = `calc(${maxH}px - (${maxH} - ${minH}) * ${progress})`;
  //   };

  //   // attach RAF-wrapped shrink updater
  //   let shrinkTicking = false;
  //   const rafShrink = () => {
  //     if (!shrinkTicking) {
  //       window.requestAnimationFrame(() => {
  //         setShrink();
  //         shrinkTicking = false;
  //       });
  //       shrinkTicking = true;
  //     }
  //   };

  //   window.addEventListener("scroll", rafShrink, { passive: true });
  //   window.addEventListener("resize", rafShrink);
  //   // initial set
  //   setShrink();

  //   return () => {
  //     window.removeEventListener("scroll", updateOffsets);
  //     window.removeEventListener("resize", updateOffsets);
  //     window.removeEventListener("scroll", rafShrink);
  //     window.removeEventListener("resize", rafShrink);
  //   };
  // }, []);
  const [scrollProgress, setScrollProgress] = useState(0);

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
        <div
          className={`
        `}
          ref={navbarRef}
        ></div>
        <div
          ref={heroRef}
          className={`${styles.imageBackgound} 
          `}
        >
          <Navbar scrollProgress={scrollProgress} />

          <TopFilterSection
            isMobile={isMobile}
            scrollProgress={scrollProgress}
          />
        </div>
        {/* {isScrolled && (
          <div
            className={styles.imageSpacer}
            aria-hidden="true"
          />
        )} */}
        {/* <div className={`${styles.imageBackgoundRes} ${isScrolled ? styles.visible : ""}`}>
          <TopFilterResponsiveSec />
        </div> */}
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
    </>
  );
}

import { Suspense } from "react";

export default function FlightsLayout({ children }) {
  return (
    <FlightFilterProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <TripTypeProvider>
          <LayoutContent>{children}</LayoutContent>
        </TripTypeProvider>
      </Suspense>
    </FlightFilterProvider>
  );
}
