"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./SignatureExperiences.module.css";
import Carousel from "@/app/3dCarousel/component/Carousel";
import CarouselMobile from "@/app/3dCarousel/component/CarouselMobile";
const baseCarouselData = [
  {
    id: 1,
    image: "/images/img1.jpg",
    title: "TANZANIA & ZANZIBAR",
    description: "SAFARI IN THE LAND OF THE MASAI HAKUNA MATATA ON...",
    price: "₹20,000",
    hasNewTag: true,
    bottomTitle: "Tanzania & Zanzibar",
    bottomDescription: "Safari In The Land Of The Masai Hakuna Matata On...",
  },
  {
    id: 4,
    image: "/images/img2.jpg",
    title: "MADAGASCAR",
    description: "The North: National Parks And Paradise Like Beaches",
    price: "₹22,000",
    hasNewTag: true,
    bottomTitle: "Madagascar",
    bottomDescription: "The North: National Parks And Paradise Like Beaches",
  },
  {
    id: 5,
    image: "/images/img3.jpg",
    title: "JAPAN",
    description: "Japan In The Winter",
    smallContent: true,
    price: "₹25,000",
    hasNewTag: false,
    bottomTitle: "Japan",
    bottomDescription: "Japan In The Winter",
  },
  {
    id: 3,
    image: "/images/img5.jpg",
    title: "UZBEKISTAN",
    description: "From Fergana To Khiva",
    price: "₹18,000",
    smallContent: true,
    hasNewTag: false,
    bottomTitle: "Uzbekistan",
    bottomDescription: "From Fergana To Khiva",
  },
  {
    id: 2,
    image: "/images/img4.jpg",
    title: "SENEGAL",
    description: "In The Heart Of East Senegal And The Shine Shaloum",
    price: "₹15,000",
    hasNewTag: true,
    bottomTitle: "Senegal",
    bottomDescription: "In The Heart Of East Senegal And The Shine Shaloum",
  },
  {
    id: 6,
    image: "/images/img1.jpg",
    title: "ICELAND",
    description: "Land of Fire and Ice",
    price: "₹30,000",
    hasNewTag: false,
    bottomTitle: "Iceland",
    bottomDescription: "Land of Fire and Ice",
  },
  {
    id: 7,
    image: "/images/img3.jpg",
    title: "NEW ZEALAND",
    description: "Adventure awaits in Middle Earth",
    price: "₹35,000",
    hasNewTag: true,
    bottomTitle: "New Zealand",
    bottomDescription: "Adventure awaits in Middle Earth",
  },
  {
    id: 8,
    image: "/images/img4.jpg",
    title: "THAILAND",
    description: "Tropical Paradise",
    price: "₹12,000",
    hasNewTag: false,
    bottomTitle: "Thailand",
    bottomDescription: "Tropical Paradise",
  },
  {
    id: 9,
    image: "/images/img4.jpg",
    title: "NEW ZEALAND",
    description: "Adventure awaits in Middle Earth",
    price: "₹35,000",
    hasNewTag: true,
    bottomTitle: "New Zealand",
    bottomDescription: "Adventure awaits in Middle Earth",
  },
  {
    id: 10,
    image: "/images/img4.jpg",
    title: "THAILAND",
    description: "Tropical Paradise",
    price: "₹12,000",
    hasNewTag: false,
    bottomTitle: "Thailand",
    bottomDescription: "Tropical Paradise",
  },
];
const SignatureExperiences = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const rotate = (arr, n) => [...arr.slice(n), ...arr.slice(0, n)];
  const tabsData = [
    { title: "Africa", carouselData: rotate(baseCarouselData, 0) },
    { title: "Asia", carouselData: rotate(baseCarouselData, 1) },
    { title: "Central America", carouselData: rotate(baseCarouselData, 2) },
    { title: "Europe", carouselData: rotate(baseCarouselData, 3) },
    { title: "Indian Ocean", carouselData: rotate(baseCarouselData, 4) },
    { title: "Middle East", carouselData: rotate(baseCarouselData, 5) },
    { title: "Oceania", carouselData: rotate(baseCarouselData, 6) },
    { title: "South America", carouselData: rotate(baseCarouselData, 7) },
    // { title: "Bali", carouselData: rotate(baseCarouselData, 4) },
    // { title: "Maldives", carouselData: rotate(baseCarouselData, 0) },
  ];

  const tabsRef = useRef(null);

  useEffect(() => {
    if (!tabsRef.current) return; // ✅ prevent crash

    const tabs = tabsRef.current;
    const activeTabEl = tabs.querySelector(`.${styles.activeTab}`);

    if (!activeTabEl) return;

    tabs.style.setProperty("--indicator-width", `${activeTabEl.offsetWidth}px`);
    tabs.style.setProperty("--indicator-left", `${activeTabEl.offsetLeft}px`);
  }, [activeTab]);
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Signature Experiences by Target Tours
        </h2>

        <nav className={styles.tabsWrap}>
          <ul className={styles.tabs} ref={tabsRef}>
            {tabsData.map((tab, index) => (
              <li
                key={tab.title}
                className={`${styles.tab} ${index === activeTab ? styles.activeTab : ""
                  }`}
                onClick={() => setActiveTab(index)}
              >
                <button className={styles.tabBtn}>{tab.title}</button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobileSelectWrap}>
          <button
            className={styles.mobileSelect}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span>{tabsData[activeTab].title}</span>
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2.5L7 7.5L12 2.5"
                stroke="#000033"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isOpen && (
            <ul className={styles.mobileOptions}>
              {tabsData.map((tab, index) => (
                <li
                  key={tab.title}
                  className={index === activeTab ? styles.activeOption : ""}
                  onClick={() => {
                    setActiveTab(index);
                    setIsOpen(false);
                  }}
                >
                  {tab.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`w-screen! overflow-hidden ${styles.desktopCarousel} `}>
          <Carousel slideData={tabsData[activeTab].carouselData} />
        </div>
        <div className={`w-screen! overflow-hidden ${styles.mobileCarousel} `}>
          <CarouselMobile slideData={tabsData[activeTab].carouselData} />
        </div>
      </div>
    </section>
  );
};

export default SignatureExperiences;
