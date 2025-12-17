"use client"
import React, { useEffect, useRef } from 'react'
import styles from './ExploreStays.module.css'
import ExpCarousel from '@/app/exploreCarousel/component/ExpCarousel'

const ExploreStays = () => {

    const [activeTab, setActiveTab] = React.useState("All");

    const handleTabChange = (t) => {
        setActiveTab(t);
    };
    const tabsRef = useRef(null);

    useEffect(() => {
        if (!tabsRef.current) return;   // ✅ prevent crash

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


    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>
                    Explore stays in the usual hotspots.
                </h2>

                <nav className={styles.tabsWrap}>
                    <ul className={styles.tabs} ref={tabsRef}>
                        {['All', 'Beach', 'Hiking', 'Family', 'Ski', 'Culture', 'Wellness and Retreat'].map((t) => (
                            <li
                                key={t}
                                className={`${styles.tab} ${activeTab === t ? styles.active : ""}`}
                                onClick={() => handleTabChange(t)}
                            >

                                <button
                                    className={styles.tabBtn}

                                >
                                    {t}
                                </button>
                            </li>
                        ))}
                        {/* moving underline */}
                        <span className={styles.tabIndicator} />
                    </ul>
                </nav>

                <div>
                    <ExpCarousel activeTab={activeTab} />
                </div>
            </div>
        </section>
    )
}

export default ExploreStays
