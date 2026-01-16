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
import Availabilitymobile from './availabilityMobile/Availabilitymobile'
import BookingFooter from './bookingFooter/BookingFooter'
import PriceSummary from './priceSummary/PriceSummary'
import { AnimatePresence } from 'framer-motion'

const HotelDetaislMobileView = () => {
    const [showPriceSummary, setShowPriceSummary] = useState(false);
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

                    <button className={styles.viewGalleryBtn} >
                        <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                    </button>
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
                    <DescriptionComponent />
                    <Amenities />
                    <Availabilitymobile />
                    <HotelPolicies />
                    <Testimonial />
                    <BarcelonaSection />
                    <FeatureSection />
                    <Footer />
                    <BookingFooter
                        title="Starting From"
                        amount="₹ 66,945"
                        onInfoClick={() => setShowPriceSummary(true)}
                        onContinue={() => setCurrentStep(4)}
                    />;


                    <AnimatePresence mode="wait">
                        {showPriceSummary && (
                            <PriceSummary onClose={() => setShowPriceSummary(false)} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default HotelDetaislMobileView