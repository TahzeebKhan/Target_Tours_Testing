"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import styles from "./HotelFilterSheet.module.css";

const FILTER_SECTIONS = [
  {
    key: "suggested",
    title: "SUGGESTED",
    options: [
      { key: "lastMinuteDeals", label: "Last Minute Deals" },
      { key: "fiveStar", label: "5 Star" },
      { key: "fourStar", label: "4 Star" },
      { key: "breakfastIncluded", label: "Breakfast Included" },
      { key: "oneClickRewards", label: "OneCircle Rewards" },
    ],
  },
  {
    key: "price",
    title: "PRICE PER NIGHT",
    options: [
      { key: "0-2500", label: "Under ₹2,500" },
      { key: "2500-4500", label: "₹2,500 - ₹4,500" },
      { key: "4500-7000", label: "₹4,500 - ₹7,000" },
      { key: "7000-11000", label: "₹7,000 - ₹11,000" },
      { key: "11000-17000", label: "₹11,000 - ₹17,000" },
      { key: "17000+", label: "₹17,000+" },
    ],
  },
  {
    key: "starCategory",
    title: "STAR CATEGORY",
    options: [
      { key: "5", label: "5 Star" },
      { key: "4", label: "4 Star" },
      { key: "3", label: "3 Star" },
    ],
  },
  {
    key: "propertyType",
    title: "PROPERTY TYPE",
    options: [
      { key: "hotel", label: "Hotel" },
      { key: "resort", label: "Resort" },
      { key: "villa", label: "Villa" },
      { key: "homestay", label: "Homestay" },
      { key: "apartment", label: "Apartment" },
    ],
  },
  {
    key: "roomViews",
    title: "ROOM VIEWS",
    options: [
      { key: "city", label: "City View" },
      { key: "garden", label: "Garden View" },
      { key: "mountain", label: "Mountain View" },
      { key: "lake", label: "Lake View" },
    ],
  },
  {
    key: "roomAmenities",
    title: "ROOM AMENITIES",
    options: [
      { key: "airConditioning", label: "Air Conditioning" },
      { key: "balcony", label: "Balcony" },
      { key: "bathtub", label: "Bathtub" },
      { key: "kitchenette", label: "Kitchenette" },
    ],
  },
  {
    key: "hotelAmenities",
    title: "HOTELS AMENTIES",
    options: [
      { key: "wifi", label: "Wifi" },
      { key: "swimmingPool", label: "Swimming Pool" },
      { key: "restaurant", label: "Restaurant" },
      { key: "parking", label: "Parking" },
    ],
  },
  {
    key: "houseRules",
    title: "HOUSE RULES",
    options: [
      { key: "familyFriendly", label: "Family Friendly" },
      { key: "coupleFriendly", label: "Couple Friendly" },
      { key: "petsAllowed", label: "Pets Allowed" },
      { key: "smokingAllowed", label: "Smoking Allowed" },
    ],
  },
  {
    key: "flexibleCheckIn",
    title: "CHECK IN CHECK OUT",
    options: [
      { key: "earlyCheckIn", label: "Early Check In" },
      { key: "lateCheckOut", label: "Late Check Out" },
      { key: "twentyFourHour", label: "24 Hour Check In" },
    ],
  },
  {
    key: "hotelChains",
    title: "HOTELCHAINS",
    options: [
      { key: "taj", label: "Taj" },
      { key: "radisson", label: "Radisson" },
      { key: "hyatt", label: "Hyatt" },
      { key: "marriott", label: "Marriott" },
    ],
  },
];

const getCount = (counts = {}, sectionKey, optionKey) => {
  const value = counts?.[sectionKey]?.[optionKey];
  return Number.isFinite(Number(value)) ? Number(value) : 0;
};

export default function HotelFilterSheet({
  open,
  onClose,
  counts = {},
  selectedFilters = {},
  onApply,
  onReset,
}) {
  const [activeSection, setActiveSection] = useState(FILTER_SECTIONS[0].key);
  const [draftFilters, setDraftFilters] = useState(selectedFilters || {});

  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      setDraftFilters(selectedFilters || {});
      setActiveSection(FILTER_SECTIONS[0].key);
    }
  }, [open, selectedFilters]);

  const section = useMemo(
    () => FILTER_SECTIONS.find((item) => item.key === activeSection) || FILTER_SECTIONS[0],
    [activeSection],
  );

  if (!open) return null;

  const toggleFilter = (group, key) => {
    setDraftFilters((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: !prev[group]?.[key],
      },
    }));
  };

  const resetFilters = () => {
    setDraftFilters({});
    onReset?.();
  };

  return (
    <>
      <button type="button" className={styles.overlay} aria-label="Close filters" onClick={onClose} />
      <section className={styles.sheet} aria-label="Hotel filters">
        <header className={styles.header}>
          <span>FILTERS</span>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          <nav className={styles.sectionNav} aria-label="Filter categories">
            {FILTER_SECTIONS.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`${styles.sectionButton} ${activeSection === item.key ? styles.sectionButtonActive : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                {item.title}
              </button>
            ))}
          </nav>

          <div className={styles.options}>
            {section.options.map((option) => (
              <label className={styles.optionRow} key={option.key}>
                <input
                  type="checkbox"
                  checked={!!draftFilters[section.key]?.[option.key]}
                  onChange={() => toggleFilter(section.key, option.key)}
                />
                <span className={styles.checkbox} />
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionCount}>
                  {getCount(counts, section.key === "price" ? "priceBuckets" : section.key, option.key)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <footer className={styles.actionBar}>
          <button type="button" className={styles.resetButton} onClick={resetFilters}>
            RESET
          </button>
          <button
            type="button"
            className={styles.applyButton}
            onClick={() => {
              onApply?.(draftFilters);
              onClose?.();
            }}
          >
            APPLY
          </button>
        </footer>
      </section>
    </>
  );
}
