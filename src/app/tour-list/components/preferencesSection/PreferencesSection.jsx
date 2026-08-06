"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PreferencesSection.module.css";

import SelectDestination from "@/features/profile/components/selectDestination";
import SelectTravellerProfile from "@/features/profile/components/selectTravellerProfile";
import SelectPreferences from "@/features/profile/components/selectPreferences";

export default function PreferencesSection({ onClose, onSelect }) {
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
      <div
        className={`${styles.card
          }`}
        onClick={() => onSelect("DESTINATIONS")}
      >
        <h2>DESTINATIONS</h2>
        <p>Where would you like to go?</p>
      </div>
      <div
        className={`${styles.card}`}
        onClick={() => onSelect("TRAVELLER")}
      >
        <h2>TRAVELER PROFILES</h2>
        <p>What is your traveler profile?</p>
      </div>
      <div
        className={`${styles.card
          }`}
        onClick={() => onSelect("PREFERENCES")}
      >
        <h2>YOUR PREFERENCES</h2>
        <p>Any specific preference?</p>
      </div>
    </div>
  );
}
