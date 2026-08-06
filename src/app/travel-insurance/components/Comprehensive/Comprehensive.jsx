"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Comprehensive.module.css";

const cardData = [
  {
    id: 1,
    icon: "/icons/flight-icon.svg",
    title: "MISSED OR DELAYED FLIGHTS",
    description:
      "If your flight is delayed or cancelled, we step in to ease the impact with timely compensation.",
  },
  {
    id: 2,
    icon: "/icons/baggage-icon.svg",
    title: "BAGGAGE DELAYS OR LOSS",
    description:
      "Don’t let missing luggage ruin your trip. We cover essentials until your bags arrive—or reimburse if they don’t.",
  },
  {
    id: 3,
    icon: "/icons/interruption-icon.svg",
    title: "TRIP INTERRUPTIONS",
    description:
      "If unexpected events cut your journey short, we help recover your costs so you can focus on what matters.",
  },
];

export default function Comprehensive() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section className={styles.sectionContainer}>
      <header className={styles.header}>
        <h2 className={styles.mainHeading}>
          Comprehensive Coverage For Every Journey
        </h2>
        <p className={styles.subHeading}>
          Whether You're Taking A Weekend Getaway Or An Extended International
          Trip, We've Got You Covered With Flexible Plans Designed For Your
          Needs.
        </p>
      </header>

      <div className={styles.gridContainer}>
        {cardData.map((card, index) => (
          <div
            key={card.id}
            className={`${styles.card} ${
              activeIndex === index ? styles.active : ""
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <div className={styles.iconWrapper}>
              <Image
                src={card.icon}
                alt={card.title}
                width={32}
                height={32}
                className={styles.icon}
              />
            </div>
            <div className={styles.cardTextWrapper}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonWrapper}>
        <button className={styles.ctaButton}>SEE FULL COVERAGE DETAILS</button>
      </div>
    </section>
  );
}
