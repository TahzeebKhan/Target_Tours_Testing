"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./visaDestination.module.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "e-visa", label: "E-Visa" },
  { key: "arrival", label: "Visa on Arrival" },
  { key: "embassy", label: "Embassy Visa" },
];

const DESTINATIONS = [
  {
    id: "vietnam-tourist",
    flag: "🇻🇳",
    country: "Vietnam",
    region: "Southeast Asia",
    description:
      "Single-entry tourist e-Visa. Approval in 3-5 working days, no embassy visit.",
    tag: "Tourist E-Visa",
    days: "3-4 Days",
    category: "e-visa",
    popular: true,
  },
  {
    id: "indonesia-bali",
    flag: "🇮🇩",
    country: "Indonesia",
    region: "Southeast Asia",
    description:
      "Pre-approval for Bali, Jakarta and more. Show the approval letter at arrival.",
    tag: "Visa on Arrival (Pre-Approval)",
    days: "3-4 Days",
    category: "arrival",
    popular: true,
  },
  {
    id: "uk-eta",
    flag: "🇬🇧",
    country: "United Kingdom (ETA)",
    region: "Southeast Asia",
    description:
      "Quick electronic authorisation linked to your passport. Near-instant for most travellers.",
    tag: "Electronic Travel Authorisation",
    days: "3-4 Days",
    category: "e-visa",
    popular: true,
  },
  {
    id: "usa-b1b2",
    flag: "🇺🇸",
    country: "United States",
    region: "Southeast Asia",
    description:
      "Embassy interview required. We help you prep — DS-160 style form, document vault, slot...",
    tag: "B1/B2 Tourist & Business",
    days: "3-4 Days",
    category: "embassy",
    popular: true,
  },
  {
    id: "france-schengen",
    flag: "🇫🇷",
    country: "France (Schengen)",
    region: "Southeast Asia",
    description:
      "Biometric appointment at VFS. We courier your passport back once decided.",
    tag: "Schengen Short-Stay",
    days: "3-4 Days",
    category: "embassy",
    popular: true,
  },
  {
    id: "vietnam-pure",
    flag: "🇻🇳",
    country: "Vietnam",
    region: "Southeast Asia",
    description:
      "Single-entry tourist e-Visa. Approval in 3-5 working days, no embassy visit.",
    tag: "Pure E-Visa",
    days: "3-4 Days",
    category: "e-visa",
    popular: true,
  },
];

const VisaDestination = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const router = useRouter();
  const visibleDestinations = useMemo(() => {
    if (activeFilter === "all") return DESTINATIONS;
    return DESTINATIONS.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Most Popular Destination</h2>
          <div className={styles.filters} aria-label="Visa destination filters">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`${styles.filterButton} ${
                  activeFilter === filter.key ? styles.filterButtonActive : ""
                }`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          {visibleDestinations.map((destination) => (
            <article className={styles.card} key={destination.id}>
              <div className={styles.cardTop}>
                <div className={styles.titleGroup}>
                  <span className={styles.flag} aria-hidden="true">
                    {destination.flag}
                  </span>
                  <div>
                    <h3 className={styles.cardTitle}>{destination.country}</h3>
                    <p className={styles.region}>{destination.region}</p>
                  </div>
                </div>
                {destination.popular && (
                  <span className={styles.popularBadge}>Popular</span>
                )}
              </div>

              <p className={styles.description}>{destination.description}</p>

              <div className={styles.metaRow}>
                <span className={styles.visaType}>{destination.tag}</span>
                <span className={styles.days}>{destination.days}</span>
              </div>

              <div className={styles.footer}>
                <div>
                  <p className={styles.priceLabel}>Starts From</p>
                  <p className={styles.price}>₹3,099</p>
                </div>
                <button type="button" className={styles.applyButton} onClick={() => router.push("/visa/details")}>
                  Apply Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisaDestination;
