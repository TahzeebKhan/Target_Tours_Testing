"use client";
import React, { useState, useCallback } from "react";
import styles from "./BaggageDetails.module.css";
import { useRouter } from "next/navigation";

import CabinBaggageInfo from "./Components/cabinBaggageInfo/CabinBaggageInfo";
import ExtraBaggageItem from "./Components/extraBaggageItem/ExtraBaggageItem";

import { useFlightBooking } from "../../FlightBookingContext";

/* ================== DATA ================== */

const EXTRA_BAGGAGE_ROWS = [
    [
        { image: "bags/redBag.png", weight: "5 Kg", price: 3100 },
        { image: "bags/BoxBag.png", weight: "10 Kg", price: 6200 },
    ],
    [
        { image: "bags/pinkBag.svg", weight: "15 Kg", price: 9300 },
        { image: "bags/trolly.svg", weight: "25 Kg", price: 15500 },
    ],
];

// Helper to find price by weight
const getBaggageInfo = (weight) => {
    const flatList = EXTRA_BAGGAGE_ROWS.flat();
    return flatList.find(item => item.weight === weight);
};

/* ================== FLIGHT CARD ================== */

const FlightExpandableCard = ({
    flightDestination,
    quantities,
    onIncrease,
    onDecrease,
}) => {
    return (
        <div className={styles.flightExpandableCard}>
            <div className={styles.flightExpandableHeader}>
                <h3>{flightDestination}</h3>
                <div className={styles.aboutFlightContainerRight}>
                    <span>Fri, 26 Dec 2025</span>
                    <div className={styles.dot}></div>
                    <span>23:10 - 10:40</span>
                </div>
            </div>

            <div className={styles.flightExpandableBottom}>
                {/* Cabin baggage */}
                <div className={styles.flightExpandableRows}>
                    <CabinBaggageInfo />
                    <CabinBaggageInfo />
                </div>

                {/* Extra baggage */}
                {EXTRA_BAGGAGE_ROWS.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles.flightExpandableRows}>
                        {row.map((item) => {
                            const key = `${flightDestination}-${item.weight}`;

                            return (
                                <ExtraBaggageItem
                                    key={key}
                                    image={item.image}
                                    weight={item.weight}
                                    price={item.price}
                                    quantity={quantities[key] || 0}
                                    onIncrease={() => onIncrease(key)}
                                    onDecrease={() => onDecrease(key)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ================== MAIN COMPONENT ================== */

const BaggageDetails = () => {
    const router = useRouter();
    const { setBaggage } = useFlightBooking();

    // 🔥 Quantity state (per flight + per baggage)
    const [quantities, setQuantities] = useState({});

    // Sync with Context whenever quantities change
    React.useEffect(() => {
        const newBaggageList = [];
        Object.entries(quantities).forEach(([key, qty]) => {
            if (qty > 0) {
                // Parse key "Destination-Weight"
                // Adjust split to handle possible dashes in destination if needed, 
                // but here we know destination structure.
                // A safer way is to store data differently, but let's stick to the key convention.
                // unique separator or just suffix match.
                const parts = key.split('-');
                const weight = parts[parts.length - 1]; // "5 Kg"
                // Reconstruct destination if needed, or just ignore. 
                // We only need price for the summary.

                const info = getBaggageInfo(weight);
                if (info) {
                    // Add an item for each quantity
                    for (let i = 0; i < qty; i++) {
                        newBaggageList.push({
                            ...info,
                            id: `${key}-${i}`, // unique id
                            label: `Extra Baggage ${weight}`
                        });
                    }
                }
            }
        });
        setBaggage(newBaggageList);
    }, [quantities, setBaggage]);


    const increaseQty = useCallback((key) => {
        setQuantities((prev) => ({
            ...prev,
            [key]: (prev[key] || 0) + 1,
        }));
    }, []);

    const decreaseQty = useCallback((key) => {
        setQuantities((prev) => ({
            ...prev,
            [key]: Math.max(0, (prev[key] || 0) - 1),
        }));
    }, []);

    const { setCurrentStep } = useFlightBooking();

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.passengerDetailsHeader}>
                <div className={styles.fromToContainer}>
                    <h2 className={styles.from}>Choose Your Baggage</h2>
                </div>

                <div className={styles.aboutFlightContainerRight}>
                    <span>
                        Select additional baggage for your journey. Save more when you add
                        baggage now.
                    </span>
                </div>
            </div>

            <div className={styles.flightExpandableContainer}>
                {/* FLIGHT 1 */}
                <FlightExpandableCard
                    flightDestination="DEL–BOM"
                    quantities={quantities}
                    onIncrease={increaseQty}
                    onDecrease={decreaseQty}
                />

                {/* FLIGHT 2 */}
                <FlightExpandableCard
                    flightDestination="BOM–DEL"
                    quantities={quantities}
                    onIncrease={increaseQty}
                    onDecrease={decreaseQty}
                />

                {/* BAGGAGE GUIDELINES */}
                <div className={styles.flightExpandableCard}>
                    <div className={styles.flightExpandableHeader}>
                        <h3>BAGGAGE GUIDELINES</h3>
                    </div>

                    <div className={styles.baggageBottomCard}>
                        <div className={styles.baggageGuide}>
                            <div className={styles.CabinBaggageGuide}>
                                <div className={styles.CabinBaggageGuideHeader}>
                                    <img src="/icons/cabinBagGray.svg" alt="" />
                                    <h3>Cabin Baggage</h3>
                                </div>
                                <ul className={styles.guideList}>
                                    <li>Maximum dimensions: 55cm × 40cm × 20cm</li>
                                    <li>Maximum weight: 7 kg</li>
                                    <li>Must fit in overhead bin or under seat</li>
                                    <li>One personal item also allowed</li>
                                </ul>
                            </div>

                            <div className={styles.CheckInBaggageGuide}>
                                <div className={styles.CabinBaggageGuideHeader}>
                                    <img src="/icons/cabinBagGray.svg" alt="" />
                                    <h3>Check-in Baggage</h3>
                                </div>
                                <ul className={styles.guideList}>
                                    <li>Maximum dimensions: 158 cm (L+W+H)</li>
                                    <li>Weight depends on fare</li>
                                    <li>Additional baggage chargeable</li>
                                    <li>No fragile items</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.proTip}>
                            <span className={styles.proTipText}>Pro Tip:</span>
                            <p className={styles.paraTipText}>
                                Book baggage now and save up to 40% compared to airport rates.
                                You can always modify your baggage up to 4 hours before
                                departure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTINUE BUTTON */}
            <div
                onClick={() => setCurrentStep(4)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.continueButton}>CONTINUE</button>
            </div>
        </div>
    );
};

export default BaggageDetails;
