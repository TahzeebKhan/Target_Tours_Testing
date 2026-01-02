"use client"
import React, { useState, useEffect, useCallback } from 'react'
import styles from './MealsDetails.module.css'
import Expandable from './Components/Expandable';
import MealGuidelineExpandable from './Components/mealGuidelineExpandable/MealGuidelineExpandable';
import { useFlightBooking } from '../../FlightBookingContext';
import { meals, beverages } from './mealsData';

// Helper to find meal info
const allMeals = [...meals, ...beverages];
const getMealInfo = (id) => allMeals.find(m => m.id === id);

const MealsDetails = () => {
    const { setMeals, setCurrentStep } = useFlightBooking();
    const [openTab, setOpenTab] = useState("flight");

    // State: { "DEL-BOM-1": 2, "BOM-DEL-7": 1 }
    // Key format: `${segment}-${mealId}`
    const [mealQuantities, setMealQuantities] = useState({});

    const toggleTab = (tabName) => {
        setOpenTab((prev) => (prev === tabName ? null : tabName));
    };

    // Sync with Context
    useEffect(() => {
        const selectedMeals = [];
        Object.entries(mealQuantities).forEach(([key, qty]) => {
            if (qty > 0) {
                const [segment, mealIdStr] = key.split('-');
                const mealId = parseInt(mealIdStr);
                const info = getMealInfo(mealId);

                if (info) {
                    for (let i = 0; i < qty; i++) {
                        selectedMeals.push({
                            ...info,
                            id: `${key}-${i}`,
                            segment, // useful for tracking
                            label: `${info.title} (${segment})`
                        });
                    }
                }
            }
        });
        setMeals(selectedMeals);
    }, [mealQuantities, setMeals]);

    const handleUpdateQuantity = useCallback((segment, mealId, newQty) => {
        const key = `${segment}-${mealId}`;
        setMealQuantities(prev => ({
            ...prev,
            [key]: Math.max(0, newQty)
        }));
    }, []);

    // Filter quantities for a specific segment to pass to Expandable
    // Expandable expects { mealId: qty }
    const getSegmentQuantities = (segment) => {
        const segmentQty = {};
        Object.entries(mealQuantities).forEach(([key, val]) => {
            if (key.startsWith(segment)) {
                const mealId = parseInt(key.split('-')[1]);
                segmentQty[mealId] = val;
            }
        });
        return segmentQty;
    }

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.passengerDetailsHeader}>
                <div className={styles.fromToContainer}>
                    <h2 className={styles.from}>
                        Select Your Meals
                    </h2>

                </div>

                <div className={styles.aboutFlightContainerRight}>
                    <span className={styles.subInfoText}>Pre-book your meals and save time onboard. Fresh meals prepared with quality ingredients.</span>
                </div>
            </div>

            {/* FLIGHT DETAILS */}
            <div className={`${styles.flightExpandableContainer} ${openTab === "flight" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("flight")}
                >
                    <div className={styles.flightExpandableHeaderContainer}>
                        <h3 className={styles.flightExpandableHeader}>DEL–BOM</h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "flight" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>
                    <div className={styles.aboutFlightContainerRight}>
                        <span>Fri, 26 Dec 2025</span>
                        <div className={styles.dot}></div>
                        <span>23:10 - 10:40</span>
                    </div>
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "flight" ? styles.expandOpen : ""
                        }`}
                >
                    <Expandable
                        quantities={getSegmentQuantities("DEL–BOM")}
                        onUpdateQuantity={(id, qty) => handleUpdateQuantity("DEL–BOM", id, qty)}
                    />
                </div>
            </div>

            {/* RETURN FLIGHT DETAILS */}
            <div className={`${styles.flightExpandableContainer} ${openTab === "returnFlight" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("returnFlight")}
                >
                    <div className={styles.flightExpandableHeaderContainer}>
                        <h3 className={styles.flightExpandableHeader}>BOM–DEL</h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "returnFlight" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>
                    <div className={styles.aboutFlightContainerRight}>
                        <span>Sun, 28 Dec 2025</span>
                        <div className={styles.dot}></div>
                        <span>18:00 - 20:15</span>
                    </div>
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "returnFlight" ? styles.expandOpen : ""
                        }`}
                >
                    <Expandable
                        quantities={getSegmentQuantities("BOM–DEL")}
                        onUpdateQuantity={(id, qty) => handleUpdateQuantity("BOM–DEL", id, qty)}
                    />
                </div>
            </div>

            <div className={`${styles.flightExpandableContainer} ${openTab === "mealGuidelines" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("mealGuidelines")}
                >
                    <div className={styles.flightExpandableHeaderContainer}>
                        <h3 className={styles.flightExpandableHeader}>MEAL GUIDELINES</h3>
                        <img
                            src="/icons/DownArrows.svg"
                            alt=""
                            className={`${styles.arrow} ${openTab === "mealGuidelines" ? styles.arrowRotate : ""
                                }`}
                        />
                    </div>
                </div>

                <div
                    className={`${styles.expandWrap} ${openTab === "mealGuidelines" ? styles.expandOpen : ""
                        }`}
                >
                    <MealGuidelineExpandable />
                </div>
            </div>

            <div
                onClick={() => setCurrentStep(5)}
                className={styles.continueButtonContainer}
            >
                <button className={styles.skipButton}>SKIP MEAL</button>
                <button className={styles.continueButton}>CONTINUE</button>
            </div>
        </div>
    )
}

export default MealsDetails