"use client";
import React, { useState } from "react";
import styles from "./ReviewPage.module.css";

import { useFlightBooking } from "../../FlightBookingContext";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const ReviewPage = () => {
    // 👇 default open = flight
    const { setCurrentStep } = useFlightBooking();
    const [openTab, setOpenTab] = useState("flight");

    const toggleTab = (tabName) => {
        setOpenTab((prev) => (prev === tabName ? null : tabName));
    };
    const [activeIndex, setActiveIndex] = useState(0);
    const [standardActive, setStandardActive] = useState(false);
    const [premiumActive, setPremiumActive] = useState(false);

    return (
        <div className={styles.wrapper}>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.headerTitle}>SELECT YOUR PLAN</h3>
                    <p>Total Medical Coverage Amount (For 3 Travellers)</p>

                    <div className={styles.amountRow}>
                        <div className={`${styles.amount} ${activeIndex === 0 ? styles.amountActive : ""}`}
                            onClick={() => setActiveIndex(0)}
                        >₹ 712,000</div>
                        <div className={`${styles.amount} ${activeIndex === 1 ? styles.amountActive : ""}`}
                            onClick={() => setActiveIndex(1)}
                        >₹ 712,000</div>
                        <div className={`${styles.amount} ${activeIndex === 2 ? styles.amountActive : ""}`}
                            onClick={() => setActiveIndex(2)}
                        >₹ 712,000</div>
                        <div
                            className={`${styles.amount} ${styles.amountRecommendedContainer} ${activeIndex === 3 ? styles.amountActive : ""
                                }`}
                            onClick={() => setActiveIndex(3)}
                        >
                            <span className={styles.amountRecommended}>RECOMMENDED</span>
                            ₹ 712,000
                        </div>
                        {/* <span className={styles.amountRecommended}>RECOMMENDED</span> */}
                    </div>
                </div>

                {/* STANDARD PLAN */}
                <div className={styles.planCard}>
                    <div className={styles.planHeader}>
                        <h4 className={styles.headerTitle}>STANDARD PLAN</h4>
                        <span
                            className={`${styles.radio} ${standardActive ? styles.radioActive : ""}`}
                            onClick={() => setStandardActive(!standardActive)}
                        />
                    </div>

                    <ul className={styles.list}>
                        <li> <div className={styles.check}>
                            <Check />
                        </div>Medical expenses upto <span>₹ 120,000</span></li>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Trip cancellation upto <span>₹ 95,000</span></li>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Loss/delay of baggage upto <span>₹ 110,000</span></li>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Medical expenses upto <span>₹ 130,000</span></li>
                    </ul>

                    <div className={styles.priceRow}>
                        <div className={styles.priceRowContainer}>
                            <div className={styles.perPersonContainer}>
                                <span className={styles.perPerson}>₹ 1,66,945</span>
                                <span className={styles.person}> /Person</span>
                            </div>
                            <div className={styles.totalContainer}>
                                <p className={styles.totalLabel}>TOTAL PRICE</p>
                                <p className={styles.totalPrice}>₹ 712,000</p>
                            </div>
                        </div>
                        <a className={styles.link}>See Benefits</a>
                    </div>
                </div>

                {/* PREMIUM PLAN */}
                <div className={styles.planCard}>
                    <div className={styles.planHeaderContainer}>
                        <div className={styles.planHeader}>
                            <h4>PREMIUM PLAN</h4>
                            <span
                                className={`${styles.radio} ${premiumActive ? styles.radioActive : ""}`}
                                onClick={() => setPremiumActive(!premiumActive)}
                            />
                        </div>

                        <p className={styles.subText}>Everything included from Standard Plan</p>

                    </div>
                    <ul className={styles.list}>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Medical expenses upto <span>₹ 85,000</span></li>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Trip cancellation upto <span>₹ 150,000</span></li>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Loss/delay of baggage upto <span>₹ 105,000</span></li>
                        <li>
                            <div className={styles.check}>
                                <Check />
                            </div>
                            Medical expenses upto <span>₹ 115,000</span></li>
                    </ul>

                    <div className={styles.priceRow}>
                        <div className={styles.priceRowContainer}>
                            <div className={styles.perPersonContainer}>
                                <span className={styles.perPerson}>₹ 1,66,945 </span>
                                <span className={styles.person}> /Person</span>
                            </div>
                            <div className={styles.totalContainer}>
                                <p className={styles.totalLabel}>TOTAL PRICE</p>
                                <p className={styles.totalPrice}>₹ 712,000</p>
                            </div>
                        </div>
                        <a className={styles.link}>See Benefits</a>
                    </div>
                </div>

                {/* Footer Note */}
                <div className={styles.note}>
                    Pre-existing medical conditions are not covered.
                </div>

            </div>
            {/* <div className={`${styles.flightExpandableContainer} ${openTab === "Cancellation" ? styles.flightActiveBorder : ""}`}>
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
                    <CancellationPenalty />
                </div>
            </div> */}

            <div
                onClick={() => setCurrentStep(3)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.continueButton}>CONTINUE</button>
            </div>


        </div>
    );
};

export default ReviewPage;
