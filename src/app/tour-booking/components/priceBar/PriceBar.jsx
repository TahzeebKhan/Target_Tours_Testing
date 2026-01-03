"use client";
import React, { useState } from "react";
import styles from "./PriceBar.module.css";
import CustomItinerary from "./CustomItinerary";
import { useRouter } from "next/navigation";

const PriceBar = ({
    days = "17 days, 16 nights",
    price = "₹ 66,945",
    onCall,
    onPersonalize,
    onBookNow,
    hotel = null,
}) => {
    const [itineraryOpen, setItineraryOpen] = useState(false);
    const router = useRouter();

    // fallback hotel if none provided
    const sampleHotel = hotel || {
        title: "SERENE HAVEN INN, TORONTO",
        images: ["/images/hotel-placeholder.jpg"],
    };

    const handlePersonalize = (e) => {
        onPersonalize?.(e);
        setItineraryOpen(true);
    };
    const handleBookNow = () => {
        router.push("/tour-bookings"); // 👈 your page route
    };

    return (
        <div className={styles.priceBar}>
            <div className={styles.container}>
                <div className={styles.priceLeft}>
                    <span className={styles.tripInfo}>{days}</span>
                    <span className={styles.separator}>|</span>
                    <span className={styles.priceText}>
                        From <strong>{price}</strong>
                        <span className={styles.perPerson}> / PERSON</span>
                    </span>
                </div>

                {/* RIGHT */}
                <div className={styles.priceRight}>
                    <button className={styles.iconBtn} onClick={onCall}>
                        <img src="/icons/blankPhone.svg" alt="Call" />
                    </button>

                    <button
                        className={styles.personalizeBtn}
                        onClick={handlePersonalize}
                    >
                        PERSONALIZE
                    </button>

                    <button
                        className={styles.bookNowBtn}
                        onClick={handleBookNow}
                    >
                        BOOK NOW
                    </button>
                </div>
            </div>

            <CustomItinerary
                isOpen={itineraryOpen}
                hotel={sampleHotel}
                onClose={() => setItineraryOpen(false)}
            />
        </div>
    );
};

export default PriceBar;
