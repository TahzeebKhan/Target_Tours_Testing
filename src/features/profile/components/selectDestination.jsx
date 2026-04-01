"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./selectDestination.module.css";

// const REGIONS = [
//   { id: "africa", name: "Africa", image: "/images/africa-map.svg" },
//   { id: "asia", name: "Asia", image: "/images/asia-map.svg" },
//   { id: "europe", name: "Europe", image: "/images/europe-map.svg" },
// ];
const REGIONS = [
  { id: "africa", name: "Africa", image: "/images/africa.png" },
  { id: "asia", name: "Asia", image: "/images/asia.png" },
  { id: "europe", name: "Europe", image: "/images/europe.png" },
  {
    id: "north-america",
    name: "North America",
    image: "/images/northAmerica.png",
  },
  {
    id: "south-america",
    name: "South America",
    image: "/images/southAmerica.png",
  },
  { id: "australia", name: "Australia", image: "/images/australia.png" },
  { id: "antarctica", name: "Antarctica", image: "/images/antarctica.png" },
];
const COUNTRIES = [
  "Zambia",
  "Kenya",
  "Ghana",
  "Tanzania",
  "Senegal",
  "Namibia",
  "Botswana",
  "Zimbabwe",
  "Burkina Faso",
  "Rwanda",
  "Togo",
  "Malawi",
  "Angola",
  "Mali",
  "Swaziland",
  "Lesotho",
  "Sierra Leone",
];

export default function SelectDestination({ onClose }) {
  const [open, setOpen] = useState(true);
  const [activeRegion, setActiveRegion] = useState("africa");
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeModal = () => {
    setOpen(false);
    onClose?.();
  };

  const toggleCountry = (country) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleReset = () => {
    setSelectedCountries([]);
    setActiveRegion("africa");
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div
        className={styles.container}
        onClick={(e) => e.stopPropagation()} // prevent close inside
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleStack}>
              <span className={styles.labelSmall}>DESTINATIONS</span>
              <h1 className={styles.titleLarge}>Africa</h1>
            </div>

            <button className={styles.closeButton} onClick={closeModal}>
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

        {/* Content */}
        <main className={styles.content}>
          {/* Region Selection */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>
              SELECT A GEOGRAPHICAL REGION
            </h2>

            <div className={styles.regionGrid}>
              {REGIONS.map((region) => (
                <div
                  key={region.id}
                  className={`${styles.regionCard} ${
                    activeRegion === region.id ? styles.activeRegion : ""
                  }`}
                  onClick={() => setActiveRegion(region.id)}
                >
                  <div className={styles.imageWrapper}>
                    {activeRegion === region.id && (
                      <span className={styles.checkbox}>
                        <Image
                          src="/images/check-white.svg"
                          alt="selected"
                          width={8}
                          height={8}
                        />
                      </span>
                    )}

                    <Image
                      src={region.image}
                      alt={region.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <span className={styles.regionName}>{region.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Country Selection */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>SELECT COUNTRY</h2>

            <div className={styles.countryGrid}>
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  className={`${styles.countryTag} ${
                    selectedCountries.includes(country)
                      ? styles.activeCountry
                      : ""
                  }`}
                  onClick={() => toggleCountry(country)}
                >
                  {country}
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <button className={styles.resetBtn} onClick={handleReset}>
            RESET
          </button>
          <button className={styles.applyBtn} onClick={closeModal}>
            APPLY FILTERS
          </button>
        </footer>
      </div>
    </div>
  );
}
