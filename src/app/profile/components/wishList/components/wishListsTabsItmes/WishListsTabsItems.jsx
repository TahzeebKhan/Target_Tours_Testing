"use client"
import React, { useState } from 'react'
import styles from './WishListsTabsItems.module.css'
import ExpandableTabs from '../../../expandableTabs/ExpandableTabs'
import TripsGallery from '../tripsGallery/TripsGallery'

const WishListsTabsItems = () => {
    const [activeTab, setActiveTab] = useState("all");
    const tabs = [
        { key: "all", label: "ALL" },
        { key: "hotel", label: "Hotel" },
        { key: "packages", label: "Packages" },
        { key: "travelinsurance", label: "travel insurance" },

    ];
    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.wishlistHead}>
                    <div className={styles.wishlistHeadLeft}>
                        <h3>Wish Lists</h3>
                        <p>Explore and save your favorite destinations here.</p>
                    </div>
                    <div className={styles.wishlistHeadRight}>+Create a list</div>
                </div>
                <div className={styles.br}></div>
                <ExpandableTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    styles={styles}
                />

                {activeTab === "hotel" && (
                    <div className={styles.flightInfoContainer}>
                        <TripsGallery />
                    </div>
                )}


            </div>
        </div>
    )
}

export default WishListsTabsItems