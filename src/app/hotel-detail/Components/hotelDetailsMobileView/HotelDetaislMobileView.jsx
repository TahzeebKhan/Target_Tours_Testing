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
import { useRouter } from 'next/navigation'
import { useHotelDetailData } from '../../HotelDetailDataContext'
import { HOTEL_DETAILS_KEY } from '@/shared/services/hotelSearch'

const HotelDetaislMobileView = () => {
    const { hotelDetail } = useHotelDetailData();
    const [showPriceSummary, setShowPriceSummary] = useState(false);
    const [activeTab, setActiveTab] = useState("Description");
    const sectionRefs = {
        Description: useRef(null),
        Amenities: useRef(null),
        Rooms: useRef(null),
        Reviews: useRef(null),
        "HOTEL POLICY": useRef(null),
    };
    const router = useRouter();
    const hotelGallery = () => {
        if (typeof window !== "undefined") {
            try {
                const raw = window.sessionStorage.getItem(HOTEL_DETAILS_KEY);
                const stored = raw ? JSON.parse(raw) : {};
                window.sessionStorage.setItem(
                    HOTEL_DETAILS_KEY,
                    JSON.stringify({
                        ...stored,
                        galleryImages:
                            hotelDetail?.galleryImages?.length
                              ? hotelDetail.galleryImages
                              : (hotelDetail?.images || stored?.galleryImages || []).map(
                                  (item, index) =>
                                    typeof item === "string"
                                      ? { image: item, title: `Photo ${index + 1}` }
                                      : item,
                                ),
                    }),
                );
            } catch {
                // Ignore storage failures and still navigate.
            }
        }
        router.push('/hotel-gallery');
    }


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
                    <img className={styles.hotleImg} src={hotelDetail?.images?.[0] || "/images/hotelArt1.png"} alt="" />

                    <button className={styles.viewGalleryBtn} onClick={hotelGallery}>
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
                    <div ref={sectionRefs.Description}>
                        <DescriptionComponent />
                    </div>
                    <div ref={sectionRefs.Amenities}>
                        <Amenities />
                    </div>
                    <div ref={sectionRefs.Rooms}>
                        <Availabilitymobile />
                    </div>
                    <div ref={sectionRefs["HOTEL POLICY"]}>
                        <HotelPolicies />
                    </div>
                    <div ref={sectionRefs.Reviews}>
                        <Testimonial />
                    </div>
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
