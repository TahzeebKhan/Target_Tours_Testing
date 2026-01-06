"use client";
import { useEffect, useRef } from "react";
import styles from "./Tabs.module.css";

const Tabs = ({ tabs, activeTab, onChange }) => {
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
    <nav className={styles.tabsWrap}>
      <ul className={styles.tabs} ref={tabsRef}>
        {tabs.map((tab) => (
          <li
            key={tab}
            className={`${styles.tab} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => onChange(tab)}
          >
            <button className={styles.tabBtn}>{tab}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Tabs;
