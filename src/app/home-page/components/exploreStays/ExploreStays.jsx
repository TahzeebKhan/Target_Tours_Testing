"use client"
import React from 'react'
import styles from './ExploreStays.module.css'
import ExpCarousel from '@/app/exploreCarousel/component/ExpCarousel'

const ExploreStays = () => {

    const [activeTab, setActiveTab] = React.useState("All");

    const handleTabChange = (t) => {
        setActiveTab(t);
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>
                    Popular Flights to Destination From
                </h2>

                <nav className={styles.tabsWrap}>
                    <ul className={styles.tabs}>
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
