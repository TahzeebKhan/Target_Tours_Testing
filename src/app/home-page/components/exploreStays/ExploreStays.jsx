"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from './ExploreStays.module.css'
import ExpCarousel from '@/app/exploreCarousel/component/ExpCarousel'

const ExploreStays = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [isOpen, setIsOpen] = useState(false);

    const handleTabChange = (t) => {
        setActiveTab(t);
    };

    const navItems = ['All', 'Beach', 'Hiking', 'Family', 'Ski', 'Culture', 'Wellness and Retreat']
    const tabsRef = useRef(null);

    useEffect(() => {
        if (!tabsRef.current) return;

        const tabs = tabsRef.current;
        const activeTabEl = tabs.querySelector(`.${styles.active}`);

        if (!activeTabEl) return;

        tabs.style.setProperty(
            "--indicator-width",
            `${activeTabEl.offsetWidth}px`
        );
        tabs.style.setProperty(
            "--indicator-left",
            `${activeTabEl.offsetLeft}px`
        );
    }, [activeTab]);

    const selectRef = useRef(null);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>
                    Explore stays in the usual hotspots.
                </h2>

                <nav className={styles.tabsWrap}>
                    <ul className={styles.tabs} ref={tabsRef}>
                        {navItems.map((t) => (
                            <li
                                key={t}
                                className={`${styles.tab} ${activeTab === t ? styles.active : ""}`}
                                onClick={() => handleTabChange(t)}
                            >
                                <button className={styles.tabBtn}>
                                    {t}
                                </button>
                            </li>
                        ))}
                        {/* moving underline */}
                        <span className={styles.tabIndicator} />
                    </ul>

                    {/* Mobile Select */}
                    <div className={styles.mobileSelectWrap}>
                        <button
                            className={styles.mobileSelect}
                            onClick={() => setIsOpen((prev) => !prev)}
                        >
                            <span>{activeTab.toUpperCase()}</span>
                            <svg
                                width="14"
                                height="10"
                                viewBox="0 0 14 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clipPath="url(#clip0_1073_7659)">
                                    <path
                                        d="M2 2.5L7 7.5L12 2.5"
                                        stroke="#000033"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1073_7659">
                                        <rect
                                            width="12"
                                            height="7"
                                            fill="white"
                                            transform="translate(1 1.5)"
                                        />
                                    </clipPath>
                                </defs>
                            </svg>
                        </button>

                        {isOpen && (
                            <ul className={styles.mobileOptions}>
                                {navItems.map((t) => (
                                    <li
                                        key={t}
                                        className={t === activeTab ? styles.activeOption : ""}
                                        onClick={() => {
                                            setActiveTab(t);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {t.toUpperCase()}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </nav>

                <div>
                    <ExpCarousel activeTab={activeTab} />
                </div>
            </div>
        </section>
    )
}

export default ExploreStays