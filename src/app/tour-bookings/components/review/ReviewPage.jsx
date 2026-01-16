"use client";
import React, { useState } from "react";
import styles from "./ReviewPage.module.css";

import { useFlightBooking } from "../../FlightBookingContext";
import { useRouter } from "next/navigation";
import DayByDayItinerary from "./components/dayByDayItinerary/DayByDayItinerary";
import TravelInsuranceOption from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "@/app/flight-booking-details/components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import CancellationPolicy from "@/app/hotel-booking/components/review/components/cancellationPolicy/CancellationPolicy";
import TravelerDetails from "./components/travelerDetails/TravelerDetails";
import BookingFooter from "./components/bookingFooter/BookingFooter";
import PriceSummary from "./components/priceSummary/PriceSummary";
import { AnimatePresence } from "framer-motion";

const ReviewPage = () => {
    // 👇 default open = flight
    const { setCurrentStep } = useFlightBooking();
    const [openTab, setOpenTab] = useState("flight");

    const [showPriceSummary, setShowPriceSummary] = useState(false);

    const toggleTab = (tabName) => {
        setOpenTab((prev) => (prev === tabName ? null : tabName));
    };

    return (
        <>
            <div className={styles.container}>
                {/* HEADER */}

                <div className={styles.headerBannerContainer}>
                    <div className={styles.BannerContainer}>
                        <img src="/images/splendorsImg.png" alt="" />
                        <div className={styles.priceContainer}>
                            <span className={styles.price}>From <strong>₹ 66,945 </strong></span>
                            <span className={styles.person}>/ PERSON</span>
                        </div>
                    </div>
                    <div className={styles.bannerTextContainer}>
                        <h2 className={styles.bannerHeading}>Splendors of the Canadian West</h2>
                        <div className={styles.subTextContainer}>
                            <div className={styles.dateLocationContainer}>
                                <span className={styles.dateLocation}>Sun, Jan 11, 2026</span>
                                <div className={styles.dayNightContainer}>
                                    <div className={styles.dash}></div>
                                    <span className={styles.dayNightChip}>7D/6N</span>
                                    <div className={styles.dash}></div>
                                </div>
                                <span className={styles.dateLocation}>Sat, Jan 17, 2026 / From New Delhi</span>
                            </div>
                            <div className={styles.itineraryContainer}>
                                <span className={styles.boldSpan}>2N</span>
                                <span className={styles.ubudText}>Ubud</span>
                                <span>•</span>
                                <span className={styles.boldSpan}>1N</span>
                                <span className={styles.ubudText}>Toronto</span>
                                <span>•</span>
                                <span className={styles.boldSpan}>3N</span>
                                <span className={styles.ubudText}>Oikawa</span>
                            </div>
                        </div>
                    </div>
                </div>



                {/* FLIGHT DETAILS */}
                <div className={`${styles.flightExpandableContainer} ${openTab === "flight" ? styles.flightActiveBorder : ""}`}>
                    <div
                        className={styles.flightExpandableCard}
                        onClick={() => toggleTab("flight")}
                    >
                        <h3 className={styles.flightExpandableHeader}>Day-by-Day Itinerary</h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "flight" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>

                    <div
                        className={`${styles.expandWrap} ${openTab === "flight" ? styles.expandOpen : ""
                            }`}
                    >
                        <DayByDayItinerary />

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
                    onClick={() => setCurrentStep(3)}
                    className={styles.continueButtonContainer}
                >
                    <button className={styles.continueButton}>CONTINUE</button>
                </div>




            </div>
            <BookingFooter
                title="Starting From"
                amount="₹ 66,945"
                onInfoClick={() => setShowPriceSummary(true)}
                onContinue={() => setCurrentStep(3)}
            />;


            <AnimatePresence mode="wait">
                {showPriceSummary && (
                    <PriceSummary onClose={() => setShowPriceSummary(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default ReviewPage;
