"use client";
import React, { useState } from "react";
import styles from "./SignatureExperiences.module.css";
import Carousel from "@/app/3dCarousel/component/Carousel";
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
    id: 2,
    image: "/images/img2.jpg",
    title: "SENEGAL",
    description: "In The Heart Of East Senegal And The Shine Shaloum",
    price: "₹15,000",
    hasNewTag: true,
    bottomTitle: "Senegal",
    bottomDescription: "In The Heart Of East Senegal And The Shine Shaloum",
  },
  {
    id: 3,
    image: "/images/img4.jpg",
    title: "UZBEKISTAN",
    description: "From Fergana To Khiva",
    price: "₹18,000",
    hasNewTag: false,
    bottomTitle: "Uzbekistan",
    bottomDescription: "From Fergana To Khiva",
  },
  {
    id: 4,
    image: "/images/img3.jpg",
    title: "MADAGASCAR",
    description: "The North: National Parks And Paradise Like Beaches",
    price: "₹22,000",
    hasNewTag: true,
    bottomTitle: "Madagascar",
    bottomDescription: "The North: National Parks And Paradise Like Beaches",
  },
  {
    id: 5,
    image: "/images/img5.jpg",
    title: "JAPAN",
    description: "Japan In The Winter",
    price: "₹25,000",
    hasNewTag: false,
    bottomTitle: "Japan",
    bottomDescription: "Japan In The Winter",
  },
];
const SignatureExperiences = () => {
  const [activeTab, setActiveTab] = useState(0);
  const rotate = (arr, n) => [...arr.slice(n), ...arr.slice(0, n)];
  const tabsData = [
    { title: "Explore", carouselData: rotate(baseCarouselData, 0) },
    { title: "Asia", carouselData: rotate(baseCarouselData, 1) },
    { title: "Central America", carouselData: rotate(baseCarouselData, 2) },
    { title: "Europe", carouselData: rotate(baseCarouselData, 3) },
    { title: "Indian Ocean", carouselData: rotate(baseCarouselData, 4) },
    { title: "Middle East", carouselData: rotate(baseCarouselData, 1) },
    { title: "Oceania", carouselData: rotate(baseCarouselData, 2) },
    { title: "South America", carouselData: rotate(baseCarouselData, 3) },
    // { title: "Bali", carouselData: rotate(baseCarouselData, 4) },
    // { title: "Maldives", carouselData: rotate(baseCarouselData, 0) },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Explore More With Target Tours</h2>

        <nav className={styles.tabsWrap}>
          <ul className={styles.tabs}>
            {tabsData.map((tab, index) => (
              <li
                key={tab.title}
                className={`${styles.tab} ${
                  index === activeTab ? styles.activeTab : ""
                }`}
              >
                <button
                  className={styles.tabBtn}
                  onClick={() => setActiveTab(index)}
                >
                  {tab.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="w-screen! overflow-hidden">
          <Carousel slideData={tabsData[activeTab].carouselData} />
        </div>
      </div>
    </section>
  );
};

export default SignatureExperiences;
