"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PreferencesSection.module.css";

import SelectDestination from "@/app/profile_components/selectDestination";
import SelectTravellerProfile from "@/app/profile_components/selectTravellerProfile";
import SelectPreferences from "@/app/profile_components/selectPreferences";

export default function PreferencesSection({ onClose }) {
  const wrapperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentView, setCurrentView] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const items = [
    {
      title: "DESTINATIONS",
      subtitle: "Where would you like to go?",
      view: "DESTINATIONS",
    },
    {
      title: "TRAVELER PROFILES",
      subtitle: "What is your traveler profile?",
      view: "TRAVELER_PROFILES",
    },
    {
      title: "YOUR PREFERENCES",
      subtitle: "Any specific preference?",
      view: "PREFERENCES",
    },
  ];

  function handleCardClick(item, index) {
    setActiveIndex(index);
    setCurrentView(item.view);
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {currentView === "DESTINATIONS" && (
        <SelectDestination onClose={() => setCurrentView(null)} />
      )}

      {currentView === "TRAVELER_PROFILES" && (
        <SelectTravellerProfile onClose={() => setCurrentView(null)} />
      )}

      {currentView === "PREFERENCES" && (
        <SelectPreferences onClose={() => setCurrentView(null)} />
      )}

      {!currentView &&
        items.map((item, index) => (
          <div
            key={index}
            className={`${styles.card} ${
              activeIndex === index ? styles.active : ""
            }`}
            onClick={() => handleCardClick(item, index)}
          >
            <h2>{item.title}</h2>
            <p>{item.subtitle}</p>
          </div>
        ))}
    </div>
  );
}
