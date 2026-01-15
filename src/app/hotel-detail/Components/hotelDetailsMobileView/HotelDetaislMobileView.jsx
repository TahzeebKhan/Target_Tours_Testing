"use client"
import React, { useRef, useState } from 'react'
import styles from './HotelDetaislMobileView.module.css'
import MobileTab from './mobileTab/MobileTab'
import DescriptionComponent from '../descriptionComponent/DescriptionComponent'
import Amenities from '../amenities/Amenities'
import HotelPolicies from '../hotelPolicies/HotelPolicies'
import Testimonial from '../testimonialSection/Testimonial'
import BarcelonaSection from '../BarcelonaSection/BarcelonaSection'
import Footer from '@/app/home-page/components/footer/Footer'
import FeatureSection from '@/app/home-page/components/featureSection/FeatureSection'

const HotelDetaislMobileView = () => {
    const [activeTab, setActiveTab] = useState("Description");
    const sectionRefs = {
        Description: useRef(null),
        Amenities: useRef(null),
        Rooms: useRef(null),
        Reviews: useRef(null),
        "HOTEL POLICY": useRef(null),
    };


    const handleTabChange = (tab) => {
        setActiveTab(tab);

        sectionRefs[tab]?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };
    return (
        <div className={styles.HotelDetaislMobileViewWrapper}>
            <div className={styles.HotelDetaislMobileViewContainer}>
                <div className={styles.HotelDetaislMobileViewImageContainer}>
                    <img className={styles.hotleImg} src="/images/hotelArt1.png" alt="" />
                    <div className={styles.HotelTopButtonsContainer}>
                        <div className={styles.HotelTopButtons}>
                            <img className={styles.rightIcon} src="/icons/right.svg" alt="" />
                        </div>
                        <div className={styles.rightButtons}>
                            <div className={styles.HotelTopButtons}>
                                <img src="/icons/mdi_heart.svg" alt="" />
                            </div>
                            <div className={styles.HotelTopButtons}>
                                <img src="/icons/share.svg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.HotelDetailsMobileViewContent}>
                    <div className={styles.HotelDetailsMobileViewContentHeader}>
                        <h2 className={styles.hotelName}>Hotel Arts Barcelona</h2>
                        <div className={styles.locationAndRating}>
                            <span className={styles.hotelAddress}>Barcelona, Spain</span>
                            <div className={styles.ratingSection}>
                                <div className={styles.stars}>
                                    <img src="/icons/tetimonialStart.svg" alt="" />
                                    <img src="/icons/tetimonialStart.svg" alt="" />
                                    <img src="/icons/tetimonialStart.svg" alt="" />
                                    <img src="/icons/tetimonialStart.svg" alt="" />
                                </div>
                                <div className={styles.reviewCount}>4.5 (371 reviews)</div>
                            </div>
                        </div>
                    </div>
                    <MobileTab

                        tabs={Object.keys(sectionRefs)}
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />
                    <DescriptionComponent/>
                    <Amenities/>
                    <HotelPolicies/>
                    <Testimonial/>
                    <BarcelonaSection/>
                    <FeatureSection/>
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default HotelDetaislMobileView