"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./selectPreferences.module.css";

const preferenceData = [
  { id: "adventure", label: "Adventure", src: "/images/adventure.svg" },
  { id: "beach", label: "Beach", src: "/images/beach.svg" },
  { id: "culture", label: "Culture", src: "/images/culture.svg" },
  {
    id: "sustainable",
    label: "Sustainable Tour",
    src: "/images/sustainable.svg",
  },
  { id: "food", label: "Food & Culinary", src: "/images/food.svg" },
  { id: "luxury", label: "Luxury", src: "/images/luxury.svg" },
  { id: "nature", label: "Nature", src: "/images/nature.svg" },
  { id: "selfdrive", label: "Self-drive", src: "/images/selfdrive.svg" },
  { id: "slow", label: "Slow Travel", src: "/images/slow.svg" },
  { id: "wildlife", label: "Wildlife", src: "/images/wildlife.svg" },
];

export default function SelectPreferences() {
  const [selectedIds, setSelectedIds] = useState([]);

  const togglePreference = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length < 5) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleReset = () => {
    setSelectedIds([]);
  };

  return (
    <div className={styles.overlay}>
      <section className={styles.container}>
        <header className={styles.header}>
          <div className={styles.topRow}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbLabel}>YOUR PREFERENCES</span>
            </div>
            <button className={styles.closeButton} aria-label="Close">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.sectionWrapper}>
          <h1 className={styles.title}>SELECT UP TO 5 PREFERENCES</h1>

          <div className={styles.grid}>
            {preferenceData.map((item) => (
              <div
                key={item.id}
                className={`${styles.card} ${
                  selectedIds.includes(item.id) ? styles.active : ""
                }`}
                onClick={() => togglePreference(item.id)}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className={styles.image}
                  />

                  {selectedIds.includes(item.id) && (
                    <div className={styles.checkIcon}>
                      <Image
                        src="/images/check-white.svg" 
                        alt="selected"
                        width={8}
                        height={8}
                      />
                    </div>
                  )}
                </div>

                <span className={styles.cardLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset}>
            RESET
          </button>
          <button className={styles.searchButton}>SEARCH</button>
        </footer>
      </section>
    </div>
  );
}
