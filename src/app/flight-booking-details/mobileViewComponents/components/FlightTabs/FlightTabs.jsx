"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./FlightTabs.module.css";

const tabs = [
  "FLIGHT DETAILS",
  "TRAVEL INSURANCE",
  "CANCELLATION & DATE CHANGE",
];

export default function FlightTabs({
  activeTab,
  setActiveTab,
  onFlightDetailsClick,
}) {
  const tabsRef = useRef([]);
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  useEffect(() => console.log("activetab, ", activeTab), [activeTab]);
  useEffect(() => {
    if (tabsRef.current[activeTab] && containerRef.current) {
      const activeElement = tabsRef.current[activeTab];
      const container = containerRef.current;

      const { offsetLeft, offsetWidth } = activeElement;
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      });

      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;
      const containerWidth = container.offsetWidth;

      const targetScroll = elementLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} ref={containerRef}>
        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={(el) => (tabsRef.current[index] = el)}
            className={`${styles.tab} ${
              activeTab === index ? styles.active : ""
            }`}
            onClick={() => {
              setActiveTab(index);

              
            }}
          >
            {tab}
          </button>
        ))}
        {/* Sliding indicator */}
        <div
          className={styles.indicator}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      </div>
    </div>
  );
}
