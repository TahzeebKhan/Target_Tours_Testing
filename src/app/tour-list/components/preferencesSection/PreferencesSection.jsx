"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PreferencesSection.module.css";

export default function PreferencesSection({ onClose, onSelect }) {
  const wrapperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // outside click close
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
    },
    {
      title: "TRAVELER PROFILES",
      subtitle: "What is your traveler profile?",
    },
    {
      title: "YOUR PREFERENCES",
      subtitle: "Any specific preference?",
    },
  ];

  function handleCardClick(item, index) {
    setActiveIndex(index);          // visual feedback
    onSelect?.(item);               // notify parent (optional)

    // auto close after small delay (feels like "applied")
    setTimeout(() => {
      onClose?.();
    }, 300);
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {items.map((item, index) => (
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
