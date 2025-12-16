"use client";
import React, { useState } from "react";
import styles from "./TargetTours.module.css";
import Image from "next/image";
import Carousel from "@/app/moreCarousel/components/Carousel";
import HoverExpandCarousel from "./components/page";

const TargetTours = () => {
  const [activeTab, setActiveTab] = useState("Explore");
  const cards = [
    {
      id: 1,
      img: "/images/tour.webp",
      badge: "17 Days & 16 Nights",
      title: "17 Days - Best Of India Tour",
      cities:
        "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
      price: "INR 2,30,000/Adult",
    },
    {
      id: 2,
      img: "/images/tour2.webp",
      badge: "15 Days & 16 Nights",
      title: "6 Days - Golden Triangle Tour",
      cities:
        "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
      price: "INR 2,30,000/Adult",
    },
    {
      id: 3,
      img: "/images/tour3.webp",
      badge: "17 Days & 16 Nights",
      title: "18 Days - Rajasthan In Deep",
      cities:
        "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
      price: "INR 2,30,000/Adult",
    },
    // {
    //   id: 3,
    //   img: "/images/tour3.webp",
    //   badge: "17 Days & 16 Nights",
    //   title: "18 Days - Rajasthan In Deep",
    //   cities:
    //     "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
    //   price: "INR 2,30,000/Adult",
    // },
    {
      id: 4,
      img: "/images/tour.webp",
      badge: "17 Days & 16 Nights",
      title: "17 Days - Best Of India Tour",
      cities:
        "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
      price: "INR 2,30,000/Adult",
    },
    {
      id: 5,
      img: "/images/tour2.webp",
      badge: "15 Days & 16 Nights",
      title: "6 Days - Golden Triangle Tour",
      cities:
        "Cities Covered: Delhi, Agra, Jaipur, Jodhpur, Ranakpur, Udaipur, Mumbai, Munnar, Alleppey, Cochin",
      price: "INR 2,30,000/Adult",
    },
  ];

  const rotateCards = (cards, shift) => {
    return cards.map((card, index) => ({
      ...card,
      img: cards[(index + shift) % cards.length].img,
    }));
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
  const activeTabIndex = tabs.indexOf(activeTab);

  const cardsForTab = rotateCards(cards, activeTabIndex);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Explore More With Target Tours</h2>

        <nav className={styles.tabsWrap}>
          <ul className={styles.tabs}>
            {tabs.map((t) => (
              <li
                key={t}
                className={`${styles.tab} ${
                  activeTab === t ? styles.activeTab : ""
                }`}
              >
                <button
                  className={styles.tabBtn}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* <div className={styles.grid}>
                    {cards.map((c) => (
                        <article key={c.id} className={styles.card}>
                            <div className={styles.imgWrap}>
                                <img src={c.img} alt={c.title} />
                                <div className={styles.gradient} />


                                <div className={styles.badge}>{c.badge}</div>
                                <h3 className={styles.cardTitle}>{c.title}</h3>
                            </div>
                        </article>
                    ))}
                </div> */}
        {/* <Carousel cards={cards} /> */}
        <HoverExpandCarousel cards={cardsForTab} />
        {/* 
        <div className={styles.controls}>
          <button aria-label="prev" className={styles.controlBtn}>
            ◀
          </button>
          <button aria-label="next" className={styles.controlBtn}>
            ▶
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default TargetTours;
