// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import styles from "./TargetTours.module.css";
// import Image from "next/image";
// import Carousel from "@/app/moreCarousel/components/Carousel";
// import HoverExpandCarousel from "./components/page";
// import MobileCarousel from "./components/MobileCarousel";

// const TargetTours = () => {
//   const [activeTab, setActiveTab] = useState("Explore");
//   const cards = [
//     {
//       id: 1,
//       img: "/images/tour.webp",
//       badge: "17 Days & 16 Nights",
//       title: "17 Days - Best Of India Tour",
//       cities:
//         "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
//       price: "INR 2,30,000",
//     },
//     {
//       id: 2,
//       img: "/images/tour2.webp",
//       badge: "15 Days & 16 Nights",
//       title: "6 Days - Golden Triangle Tour",
//       cities:
//         "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
//       price: "INR 2,30,000",
//       centerImage: true,
//     },
//     {
//       id: 3,
//       img: "/images/tour3.webp",
//       badge: "17 Days & 16 Nights",
//       title: "18 Days - Rajasthan In Deep",
//       cities:
//         "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
//       price: "INR 2,30,000",
//     },
//     {
//       id: 4,
//       img: "/images/tour.webp",
//       badge: "17 Days & 16 Nights",
//       title: "17 Days - Best Of India Tour",
//       cities:
//         "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
//       price: "INR 2,30,000",
//     },
//     {
//       id: 5,
//       img: "/images/tour2.webp",
//       badge: "15 Days & 16 Nights",
//       title: "6 Days - Golden Triangle Tour",
//       cities:
//         "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
//       price: "INR 2,30,000",
//       centerImage: true,
//     },
//   ];

//   const rotateCards = (cards, shift) => {
//     return [...cards.slice(shift), ...cards.slice(0, shift)];
//   };
//   const tabs = [
//     "Explore",
//     "Europe",
//     "Dubai",
//     "Rajasthan",
//     "Japan",
//     "Thailand",
//     "North East India",
//     "Spiti",
//     "Bali",
//     "Maldives",
//   ];
//   const activeTabIndex = tabs.indexOf(activeTab);
//   const tabsRef = useRef(null);

//   useEffect(() => {
//     if (!tabsRef.current) return; // ✅ prevent crash

//     const tabs = tabsRef.current;
//     const activeTabEl = tabs.querySelector(`.${styles.activeTab}`);

//     if (!activeTabEl) return;

//     tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
//     tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
//   }, [activeTab]);

//   const cardsForTab = rotateCards(cards, activeTabIndex);
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <section className={styles.section}>
//       <div className={styles.container}>
//         <h2 className={styles.heading}>Explore More With Target Tours</h2>
//         <nav className={styles.tabsWrap}>
//           <ul className={styles.tabs} ref={tabsRef}>
//             {tabs.map((t) => (
//               <li
//                 key={t}
//                 className={`${styles.tab} ${
//                   activeTab === t ? styles.activeTab : ""
//                 }`}
//                 onClick={() => setActiveTab(t)}
//               >
//                 <button className={styles.tabBtn}>{t}</button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//         {/* Mobile Select */}
//         <div className={styles.mobileSelectWrap}>
//           <button
//             className={styles.mobileSelect}
//             onClick={() => setIsOpen((prev) => !prev)}
//           >
//             <span>{activeTab.toUpperCase()}</span>
//             <svg
//               width="14"
//               height="10"
//               viewBox="0 0 14 10"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <g clipPath="url(#clip0_1073_7659)">
//                 <path
//                   d="M2 2.5L7 7.5L12 2.5"
//                   stroke="#000033"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </g>
//               <defs>
//                 <clipPath id="clip0_1073_7659">
//                   <rect
//                     width="12"
//                     height="7"
//                     fill="white"
//                     transform="translate(1 1.5)"
//                   />
//                 </clipPath>
//               </defs>
//             </svg>
//           </button>

//           {isOpen && (
//             <ul className={styles.mobileOptions}>
//               {tabs.map((t) => (
//                 <li
//                   key={t}
//                   className={t === activeTab ? styles.activeOption : ""}
//                   onClick={() => {
//                     setActiveTab(t);
//                     setIsOpen(false);
//                   }}
//                 >
//                   {t.toUpperCase()}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//         {/* <div className={styles.grid}>
//                     {cards.map((c) => (
//                         <article key={c.id} className={styles.card}>
//                             <div className={styles.imgWrap}>
//                                 <img src={c.img} alt={c.title} />
//                                 <div className={styles.gradient} />


//                                 <div className={styles.badge}>{c.badge}</div>
//                                 <h3 className={styles.cardTitle}>{c.title}</h3>
//                             </div>
//                         </article>
//                     ))}
//                 </div> */}
//         {/* <Carousel cards={cards} /> */}
//         <div className={styles.desktopCarousel}>
//           {" "}
//           <HoverExpandCarousel activeTab={activeTab} cards={cardsForTab} />
//         </div>
//         <div className={styles.mobileCarousel}>

//           <MobileCarousel activeTab={activeTab} cards={cardsForTab} />
//         </div>
//         {/* 
//         <div className={styles.controls}>
//           <button aria-label="prev" className={styles.controlBtn}>
//             ◀
//           </button>
//           <button aria-label="next" className={styles.controlBtn}>
//             ▶
//           </button>
//         </div> */}
//       </div>
//     </section>
//   );
// };

// export default TargetTours;

"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import styles from "./TargetTours.module.css";
import HoverExpandCarousel from "./components/page";
import MobileCarousel from "./components/MobileCarousel";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
const token = Cookies.get("auth_token");
const FALLBACK_TABS = [
  "Asia",
  "Explore",
  "Europe",
  "Rajasthan",
  "Gir",
  "Delhi",
  "North East India",
  "Spiti",
  "Bali",
  "Maldives",
];
const FALLBACK_CARDS = [
  {
    id: "fallback-1",
    title: "N/A",
    cities: "N/A",
    badge: "N/A",
    price: "N/A",
    img: "/fallback.jpg",
  },
  {
    id: "fallback-2",
    title: "N/A",
    cities: "N/A",
    badge: "N/A",
    price: "N/A",
    img: "/fallback.jpg",
    centerImage: true,
  },
  {
    id: "fallback-3",
    title: "N/A",
    cities: "N/A",
    badge: "N/A",
    price: "N/A",
    img: "/fallback.jpg",
  },
];

const formatPackagePrice = (price) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "ON REQUEST";
  }

  return `INR ${numericPrice.toLocaleString("en-IN")}`;
};

const TargetTours = () => {
  const [tabs, setTabs] = useState(FALLBACK_TABS);
  const [activeTab, setActiveTab] = useState(FALLBACK_TABS[0]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const tabsRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const normalizeTopCountry = (item) => {
      if (!item) return "";
      if (typeof item === "string") return item.trim();

      return String(
        item.label ||
          item.name ||
          item.title ||
          item.country ||
          item.location_name ||
          item.value ||
          ""
      ).trim();
    };

    const fetchTopCountries = async () => {
      try {
        setLoadingTabs(true);

        const response = await fetch(
          `${API_BASE}/api/holiday-package-filters/top-countries?domain=${process.env.NEXT_PUBLIC_DOMAIN}`,
          {
            method: "GET",
            signal: controller.signal,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch top countries");
        }

        const json = await response.json();
        const rawTabs =
          json?.data?.countries ||
          json?.data?.top_countries ||
          json?.data ||
          json?.countries ||
          json?.top_countries ||
          json;

        if (!Array.isArray(rawTabs)) return;

        const nextTabs = rawTabs
          .map(normalizeTopCountry)
          .filter(Boolean);

        if (nextTabs.length === 0) return;

        setTabs(nextTabs);
        setActiveTab((prev) => (nextTabs.includes(prev) ? prev : nextTabs[0]));
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Failed to fetch top-country filters", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTabs(false);
        }
      }
    };

    fetchTopCountries();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!activeTab) return;

    const controller = new AbortController();

    const fetchTours = async () => {
      const query = new URLSearchParams({
        domain: process.env.NEXT_PUBLIC_DOMAIN,
      });

      query.set("country", activeTab);
  
      try {
        setLoading(true);
        setPackages([]);

        const res = await fetch(
          `${API_BASE}/api/explore-more/company?${query.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await res.json();
        setPackages(json?.data?.holiday_packages || []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Failed to fetch tours", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTours();
    return () => controller.abort();
  }, [activeTab]);

  // 🔹 Filter + Transform (BEST PRACTICE)
  const cardsForTab = useMemo(() => {
    return packages.map((pkg) => ({
      id: pkg.id,
      title: `${pkg.duration_days} Days - ${pkg.title}`,
      cities: pkg.description,
      badge: `${pkg.duration_days} Days & ${pkg.duration_nights} Nights`,
      price: formatPackagePrice(
        pkg.started_price ?? pkg.starting_from ?? pkg.started_from
      ),
      img:
        pkg.main_image?.url
          ? `${API_BASE}${pkg.main_image.url}`
          : pkg.media?.[0]?.package_media?.[0]?.url
          ? `${API_BASE}${pkg.media[0].package_media[0].url}`
          : "/images/fallback.webp",
    }));
  }, [packages, activeTab]);

  const finalCards =
    loading ? FALLBACK_CARDS : cardsForTab.length > 0 ? cardsForTab : FALLBACK_CARDS;

  // 🔹 Animated tab indicator
  // useEffect(() => {
  //   if (!tabsRef.current) return;
  //   const activeEl = tabsRef.current.querySelector(`.${styles.activeTab}`);
  //   if (!activeEl) return;

  //   tabsRef.current.style.setProperty(
  //     "--indicator-width",
  //     `${activeEl.offsetWidth}px`
  //   );
  //   tabsRef.current.style.setProperty(
  //     "--indicator-left",
  //     `${activeEl.offsetLeft}px`
  //   );
  // }, [activeTab]);

  useEffect(() => {
    if (tabs.length === 0) return;
    if (!tabsRef.current) return;

    requestAnimationFrame(() => {
      const activeEl = tabsRef.current.querySelector(
        `.${styles.activeTab}`
      );

      if (!activeEl) return;

      tabsRef.current.style.setProperty(
        "--indicator-width",
        `${activeEl.offsetWidth}px`
      );
      tabsRef.current.style.setProperty(
        "--indicator-left",
        `${activeEl.offsetLeft}px`
      );
    });
  }, [activeTab, tabs, loadingTabs]);


  // if (loading) {
  //   return <div className={styles.loading}>Loading tours...</div>;
  // }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Explore More With Target Tours</h2>

        {/* Tabs */}
        <nav className={styles.tabsWrap}>
          <ul className={styles.tabs} ref={tabsRef}>
            {tabs.map((tab) => (
              <li
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                <button className={styles.tabBtn}>{tab}</button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.mobileSelectWrap}>
          <button
            className={styles.mobileSelect}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span>{activeTab.toUpperCase()}</span>
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1073_7659)">
                <path
                  d="M2 2.5L7 7.5L12 2.5"
                  stroke="#000033"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1073_7659">
                  <rect
                    width="12"
                    height="7"
                    fill="white"
                    transform="translate(1 1.5)"
                  />
                </clipPath>
              </defs>
            </svg>
          </button>

          {isOpen && (
            <ul className={styles.mobileOptions}>
              {tabs.map((t) => (
                <li
                  key={t}
                  className={t === activeTab ? styles.activeOption : ""}
                  onClick={() => {
                    setActiveTab(t);
                    setIsOpen(false);
                  }}
                >
                  {t.toUpperCase()}
                </li>
              ))}
            </ul>
          )}
        </div>



        {/* Desktop */}
        <div className={styles.desktopCarousel}>
          <HoverExpandCarousel activeTab={activeTab} cards={finalCards} />
        </div>

        {/* Mobile */}
        <div className={styles.mobileCarousel}>
          <MobileCarousel activeTab={activeTab} cards={finalCards} />
        </div>
      </div>
    </section>
  );
};

export default TargetTours;
