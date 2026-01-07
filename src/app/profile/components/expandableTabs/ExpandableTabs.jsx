"use client";
import React, { useEffect, useRef } from "react";
import styles from "./ExpandableTabs.module.css";

const ExpandableTabs = ({ tabs, activeTab, setActiveTab }) => {
  const tabsRef = useRef(null);

  useEffect(() => {
    if (!tabsRef.current) return;

    const activeEl = tabsRef.current.querySelector(`.${styles.active}`);
    if (!activeEl) return;

    tabsRef.current.style.setProperty(
      "--indicator-width",
      `${activeEl.offsetWidth}px`
    );
    tabsRef.current.style.setProperty(
      "--indicator-left",
      `${activeEl.offsetLeft}px`
    );
  }, [activeTab]);

  return (
    <div className={styles.tabContainer} ref={tabsRef}>
      {tabs.map((t) => (
        <div
          key={t.key}
          className={`${styles.tabItem} ${
            activeTab === t.key ? styles.active : ""
          }`}
          onClick={() => setActiveTab(t.key)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
};

export default ExpandableTabs;
