"use client";
import React, { useState } from "react";
import styles from "./ReviewPage.module.css";

import { useTourBooking } from "../../TourBookingContext";
import { useRouter } from "next/navigation";
import DayByDayItinerary from "./components/dayByDayItinerary/DayByDayItinerary";
import TravelInsuranceOption from "./components/travelInsuranceOption/TravelInsuranceOption";
import CancellationPolicy from "./components/cancellationPolicy/CancellationPolicy";
import TravelerDetails from "./components/travelerDetails/TravelerDetails";
import BookingFooter from "./components/bookingFooter/BookingFooter";
import PriceSummary from "./components/priceSummary/PriceSummary";
import { AnimatePresence } from "framer-motion";

const ReviewPage = () => {
    // 👇 default open = flight
    const { packageDetails, prices, setCurrentStep, submitPassengers, passengerLoading } = useTourBooking();
    const [openTab, setOpenTab] = useState("dayByDayItinerary");
    const [showPriceSummary, setShowPriceSummary] = useState(false);
       const router = useRouter();

    const toggleTab = (tabName) => {
        setOpenTab((prev) => (prev === tabName ? null : tabName));
    };

    const handleContinue = async () => {
        if (passengerLoading) return;
        const created = await submitPassengers();
        if (created) {
            setCurrentStep(3);
            return;
        }
        setOpenTab("travelerDetails");
    };
    const amount = `₹ ${Number(prices?.total || 0).toLocaleString("en-IN")}`;
 

    return (
        <>
            <div className={styles.tripDetailsContainer}>
                <div className={styles.tripDetailsHeader}>
                    <img
                        onClick={() => router.back()}
                        className={styles.backArrow}
                        src="/icons/leftArrowTrip.svg"
                        alt=""
                    />
                    <p className={styles.tripDetails}>Tour Details</p>
                </div>
            </div>
            <div className={styles.container}>
                {/* HEADER */}

                <div className={styles.headerBannerContainer}>
                    <div className={styles.BannerContainer}>
                        <img src={packageDetails?.image || "/images/splendorsImg.png"} alt="" />
                        <div className={styles.priceContainer}>
                            <span className={styles.price}>From <strong>{amount} </strong></span>
                            <span className={styles.person}>/ PERSON</span>
                        </div>
                    </div>
                    <div className={styles.bannerTextContainer}>
                        <h2 className={styles.bannerHeading}>{packageDetails?.title}</h2>
                        <div className={styles.subTextContainer}>
                            <div className={styles.dateLocationContainer}>
                                <span className={styles.dateLocation}>{packageDetails?.startDate}</span>
                                <div className={styles.dayNightContainer}>
                                    <div className={styles.dash}></div>
                                    <span className={styles.dayNightChip}>{packageDetails?.durationLabel}</span>
                                    <div className={styles.dash}></div>
                                </div>
                                <span className={styles.dateLocation}>
                                    {packageDetails?.endDate} / From {packageDetails?.fromCity}
                                </span>
                            </div>
                            <div className={styles.itineraryContainer}>
                                <span className={styles.ubudText}>{packageDetails?.routeLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>



                {/* FLIGHT DETAILS */}
                <div className={`${styles.flightExpandableContainer} ${openTab === "dayByDayItinerary" ? styles.flightActiveBorder : ""}`}>
                    <div
                        className={styles.flightExpandableCard}
                        onClick={() => toggleTab("dayByDayItinerary")}
                    >
                        <h3 className={styles.flightExpandableHeader}>Day-by-Day Itinerary</h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "dayByDayItinerary" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>

                    <div
                        className={`${styles.expandWrap} ${openTab === "dayByDayItinerary" ? styles.expandOpen : ""
                            }`}
                    >
                        <DayByDayItinerary itinerary={packageDetails?.itinerary} />

                    </div>
                </div>

                {/* INSURANCE */}
                <div className={`${styles.flightExpandableContainer} ${openTab === "insurance" ? styles.flightActiveBorder : ""}`}>
                    <div
                        className={styles.flightExpandableCard}
                        onClick={() => toggleTab("insurance")}
                    >
                        <h3 className={styles.flightExpandableHeader}>
                            Add Travel Insurance (₹399/Person)
                        </h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "insurance" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>

                    <div
                        className={`${styles.expandWrap} ${openTab === "insurance" ? styles.expandOpen : ""
                            }`}
                    >
                        <TravelInsuranceOption />
                    </div>
                </div>



                <div className={`${styles.flightExpandableContainer} ${openTab === "travelerDetails" ? styles.flightActiveBorder : ""}`}>
                    <div
                        className={styles.flightExpandableCard}
                        onClick={() => toggleTab("travelerDetails")}
                    >
                        <h3 className={styles.flightExpandableHeader}>
                            TRAVELER Details
                        </h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "travelerDetails" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>

                    <div
                        className={`${styles.expandWrap} ${openTab === "travelerDetails" ? styles.expandOpen : ""
                            }`}
                    >
                        <TravelerDetails />
                    </div>
                </div>
                <div className={`${styles.flightExpandableContainer} ${openTab === "Cancellation" ? styles.flightActiveBorder : ""}`}>
                    <div
                        className={styles.flightExpandableCard}
                        onClick={() => toggleTab("Cancellation")}
                    >
                        <h3 className={styles.flightExpandableHeader}>
                            Cancellation & Date Change Policy
                        </h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "Cancellation" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>

                    <div
                        className={`${styles.expandWrap} ${openTab === "Cancellation" ? styles.expandOpen : ""
                            }`}
                    >
                        <CancellationPolicy />
                    </div>
                </div>

                <div
                    onClick={handleContinue}
                    className={styles.continueButtonContainer}
                >
                    <button className={styles.continueButton} disabled={passengerLoading}>
                        {passengerLoading ? "LOADING..." : "CONTINUE"}
                    </button>
                </div>




            </div>
            <div className={styles.footerContainer}>
                <BookingFooter
                    title="Starting From"
                    amount={amount}
                    onInfoClick={() => setShowPriceSummary(true)}
                    onContinue={handleContinue}
                />;


                <AnimatePresence mode="wait">
                    {showPriceSummary && (
                        <PriceSummary onClose={() => setShowPriceSummary(false)} />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default ReviewPage;
