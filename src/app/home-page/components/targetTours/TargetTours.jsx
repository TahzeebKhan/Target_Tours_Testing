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

const TAB_REGION_MAP = {
  Explore: null,
  Europe: "EUROPE",
  Dubai: "MIDDLE_EAST",
  Rajasthan: "INDIA",
  Japan: "JAPAN",
  Thailand: "SOUTHEAST_ASIA",
  "North East India": "INDIA",
  Spiti: "INDIA",
  Bali: "SOUTHEAST_ASIA",
  Maldives: "SOUTH_ASIA",
};

const tabs = [
  "Explore",
  "Europe",
  "Dubai",
  "Rajasthan",
  "Japan",
  "Thailand",
  "North East India",
  "Spiti",
  "Bali",
  "Maldives",
];

const STATIC_CARDS = [
  {
    id: 1,
    img: "/images/tour.webp",
    badge: "17 Days & 16 Nights",
    title: "Best Of India Tour",
    cities: "Delhi, Agra, Jaipur, Jodhpur",
    price: "INR 2,30,000",
  },
  {
    id: 2,
    img: "/images/tour2.webp",
    badge: "6 Days & 5 Nights",
    title: "Golden Triangle Tour",
    cities: "Delhi, Agra, Jaipur",
    price: "INR 1,20,000",
    centerImage: true,
  },
  {
    id: 3,
    img: "/images/tour3.webp",
    badge: "8 Days & 7 Nights",
    title: "Rajasthan In Depth",
    cities: "Jaipur, Jodhpur, Udaipur",
    price: "INR 1,80,000",
  },
];


const TargetTours = () => {
  const [activeTab, setActiveTab] = useState("Explore");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const tabsRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Fetch once
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/explore-more/company?originalRegion=AMERICA`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await res.json();
        setPackages(json?.data?.holiday_packages || []);
      } catch (err) {
        console.error("Failed to fetch tours", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // 🔹 Filter + Transform (BEST PRACTICE)
  const cardsForTab = useMemo(() => {
    const region = TAB_REGION_MAP[activeTab];

    const filtered = region
      ? packages.filter((p) => p.region === region)
      : packages;

    return filtered.map((pkg) => ({
      id: pkg.id,
      title: `${pkg.duration_days} Days - ${pkg.title}`,
      cities: pkg.description,
      badge: `${pkg.duration_days} Days & ${pkg.duration_nights} Nights`,
      price: "INR 2,30,000", // 🔁 replace when backend sends price
      img:
        pkg.media?.[0]?.package_media?.[0]?.url
          ? `${API_BASE}${pkg.media[0].package_media[0].url}`
          : "/images/fallback.webp",
    }));
  }, [packages, activeTab]);

  const finalCards =
    cardsForTab && cardsForTab.length > 0
      ? cardsForTab
      : STATIC_CARDS;

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
  }, [activeTab]);


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
