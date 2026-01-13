"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./selectDestination.module.css";

const REGIONS = [
  { id: "africa", name: "Africa", image: "/images/africa-map.svg" },
  { id: "asia", name: "Asia", image: "/images/asia-map.svg" },
  { id: "europe", name: "Europe", image: "/images/europe-map.svg" },
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

export default function SelectDestination() {
  const [activeRegion, setActiveRegion] = useState("africa");
  const [selectedCountries, setSelectedCountries] = useState([]);

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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleStack}>
              <span className={styles.labelSmall}>DESTINATIONS</span>
              <h1 className={styles.titleLarge}>Africa</h1>
            </div>
            <button className={styles.closeButton}>
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

        {/* Footer Actions */}
        <footer className={styles.footer}>
          <button className={styles.resetBtn} onClick={handleReset}>
            RESET
          </button>
          <button className={styles.applyBtn}>APPLY FILTERS</button>
        </footer>
      </div>
    </div>
  );
}
