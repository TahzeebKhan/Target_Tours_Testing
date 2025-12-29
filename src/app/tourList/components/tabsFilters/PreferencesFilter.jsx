import React, { useState } from "react";
import styles from "./PreferencesFilter.module.css";
import CustomCheckbox from "@/app/components/CustomCheckbox";

const PREFERENCES = [
  {
    id: "adventure",
    label: "Adventure",
    imageUrl: "/images/adventure.png",
  },
  { id: "beach", label: "Beach", imageUrl: "/images/beach.png" },
  { id: "culture", label: "Culture", imageUrl: "/images/culture.png" },
  {
    id: "sustainable",
    label: "Sustainable Tour",
    imageUrl: "/images/tour.png",
  },
  { id: "food", label: "Food & Culinary", imageUrl: "/images/food.png" },
  { id: "luxury", label: "Luxury", imageUrl: "/images/luxury.png" },
  { id: "nature", label: "Nature", imageUrl: "/images/nature.png" },
  {
    id: "self-drive",
    label: "Self-drive",
    imageUrl: "/images/selfDrive.png",
  },
  { id: "slow", label: "Slow Travel", imageUrl: "/images/soloTravel.png" },
  { id: "wildlife", label: "Wildlife", imageUrl: "/images/wildlife.png" },
];

const MAX_SELECTION = 5;

const PreferencesFilter = ({ onApply }) => {
  const [selectedPrefs, setSelectedPrefs] = useState([]);

  const togglePreference = (id) => {
    setSelectedPrefs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, id];
    });
  };

  const resetAll = () => setSelectedPrefs([]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h3 className={styles.heading}>Select up to 5 Preferences</h3>

        <div className={styles.content}>
          {/* LEFT */}
          <div className={styles.leftContent}>
            <p className={styles.selectionTitle}>Your Selection</p>

            <ul className={styles.selectionList}>
              {selectedPrefs.length === 0 && <li>—</li>}
              {selectedPrefs.map((id, index) => {
                const pref = PREFERENCES.find((p) => p.id === id);
                return (
                  <li key={id}>
                    {index + 1}. {pref?.label}
                  </li>
                );
              })}
            </ul>

            <div className={styles.actions}>
              <button onClick={resetAll} className={styles.resetBtn}>
                Reset All
              </button>
              <button
                className={styles.searchBtn}
                onClick={() => onApply?.(selectedPrefs)}
              >
                Search
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.cardsGrid}>
            {PREFERENCES.map((pref) => (
              <button
                key={pref.id}
                type="button"
                className={`${styles.card} ${
                  selectedPrefs.includes(pref.id) ? styles.active : ""
                }`}
                onClick={() => togglePreference(pref.id)}
              >
                <div className={styles.checkboxContainer}>
                  <CustomCheckbox
                    checked={selectedPrefs.includes(pref.id)}
                    onChange={() => togglePreference(pref.id)}
                  />
                </div>

                <img
                  src={pref.imageUrl}
                  alt={pref.label}
                  className={styles.image}
                />

                <span className={styles.label}>{pref.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesFilter;
