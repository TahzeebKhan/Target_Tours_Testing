"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./CustomItinerary.module.css";
import Stepper from "./stepper/Stepper";

const CustomItinerary = ({ isOpen, hotel, onClose }) => {
    const [selected, setSelected] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);

    const [activeCalendarTabs, setActiveCalendarTabs] = useState([]);
    // customization state
    const [hotelCategory, setHotelCategory] = useState([]);
    const addonOptions = ["Cruise", "Safari", "Adventure", "Cultural", "Wine & Dine", "Photography"];
    const [selectedAddons, setSelectedAddons] = useState([]);

    // two-thumb range values (in rupees)
    const [minPrice, setMinPrice] = useState(5000);
    const [maxPrice, setMaxPrice] = useState(100000);

    const [notes, setNotes] = useState("");

    const toggleAddon = (name) => {
        setSelectedAddons((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep((s) => s + 1);
        else {
            // final confirm (send data or close)
            const payload = { hotelCategory, selectedAddons, minPrice, maxPrice, notes };
            console.log("Custom Itinerary payload:", payload);
            // TODO: send selections to server or parent
            onClose?.();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((s) => s - 1);
        else onClose?.();
    };

    const handleMinChange = (e) => {
        const val = Number(e.target.value);
        const clamped = Math.min(val, maxPrice - 1000);
        setMinPrice(clamped);
    };

    const handleMaxChange = (e) => {
        const val = Number(e.target.value);
        const clamped = Math.max(val, minPrice + 1000);
        setMaxPrice(clamped);
    };


    const toggleCalendarTab = (type) => {
        setActiveCalendarTabs((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type) // remove
                : [...prev, type]                // add
        );
    };
    const toggleHotelCategory = (category) => {
        setHotelCategory((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };
    return (
        <AnimatePresence>
            {isOpen && hotel && (
                <motion.div
                    className={styles.popupOverlay}
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.popupCard}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -40, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -40, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    >
                        {/* HEADER */}
                        <div className={styles.popupHeader}>
                            <h4>Custom Itinerary</h4>
                            <button onClick={onClose} className={styles.closeBtn}>✕</button>
                        </div>

                        {/* CONTENT */}
                        <div className={styles.popupContent}>
                            <Stepper currentStep={currentStep} />

                            {currentStep === 1 && (
                                <div className={styles.TravelPreferences}>
                                    <div className={styles.TravelPreferencesTop}>
                                        <h3 className={styles.TravelPreferencesHeading}>Travel Preferences</h3>
                                        <p className={styles.TravelPreferencesDescription}>Tell us about your ideal travel dates and departure details</p>
                                    </div>
                                    <div className={styles.TravelPreferencesCenter}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>Travel Dates</h4>
                                        <div className={styles.calenderTabContainer}>
                                            <div
                                                className={`${styles.calenderTab} ${activeCalendarTabs.includes("fixed")
                                                    ? styles.calenderTabActive
                                                    : ""
                                                    }`}
                                                onClick={() => toggleCalendarTab("fixed")}
                                            >
                                                <img src="/icons/blackCalendar.svg" alt="" />
                                                <span className={styles.calenderTabText}>Fixed Dates</span>
                                            </div>
                                            <div
                                                className={`${styles.calenderTab} ${activeCalendarTabs.includes("flexible") ? styles.calenderTabActive : ""}
                                                    }`}
                                                onClick={() => toggleCalendarTab("flexible")}
                                            >
                                                <img src="/icons/blackCalendar.svg" alt="" />
                                                <span className={styles.calenderTabText}>Flexible Dates</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.TravelPreferencesCenter}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>Departure City</h4>
                                        <input
                                            className={styles.inputField}
                                            type="text"
                                            placeholder="e.g., New York, London, Singapore"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className={styles.TravelPreferences}>
                                    <div className={styles.TravelPreferencesTop}>
                                        <h3 className={styles.TravelPreferencesHeading}>Customize Your Experience</h3>
                                        <p className={styles.TravelPreferencesDescription}>Tailor your journey to match your preferences</p>
                                    </div>
                                    <div className={styles.section}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>HOTEL CATEGORY</h4>
                                        <div className={styles.hotelCategory}>
                                            {['Standard', 'Premium', 'Luxury'].map((c) => (
                                                <button key={c} className={`${styles.categoryOption} ${hotelCategory.includes(c) ? styles.activeCategory : ''}`} onClick={() => toggleHotelCategory(c)}>{c}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>EXPERIENCE ADD-ONS</h4>
                                        <div className={styles.addons}>
                                            {addonOptions.map((a) => (
                                                <button key={a} onClick={() => toggleAddon(a)} className={`${styles.addonPill} ${selectedAddons.includes(a) ? styles.addonActive : ''}`}>{a}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>BUDGET FOR ADD-ONS</h4>
                                        <div className={styles.rangeRow}>
                                            <div className={styles.rangeContainer} style={{ '--left': `${(minPrice / 100000) * 100}%`, '--right': `${100 - (maxPrice / 100000) * 100}%` }}>
                                                <div className={styles.sliderTrack}>
                                                    <div className={styles.sliderRange}></div>
                                                </div>
                                                <input className={styles.rangeInput} type="range" min={0} max={100000} step={1000} value={minPrice} onChange={handleMinChange} />
                                                <input className={styles.rangeInput} type="range" min={0} max={100000} step={1000} value={maxPrice} onChange={handleMaxChange} />
                                                <div className={styles.rangeValues}>
                                                    <div className={styles.rangeValueLeft}>₹{minPrice.toLocaleString()}</div>
                                                    <div className={styles.rangeValueRight}>Up ₹{maxPrice.toLocaleString()}+</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>SPECIAL REQUESTS OR NOTES</h4>
                                        <textarea className={styles.notes} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special dietary requirement, accessibility needs or something we should know about..." />
                                    </div>

                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className={styles.TravelPreferences}>
                                    <div className={styles.TravelPreferencesTop}>
                                        <h3 className={styles.TravelPreferencesHeading}>Customize Your Experience</h3>
                                        <p className={styles.TravelPreferencesDescription}>Tailor your journey to match your preferences</p>
                                    </div>
                                    <div className={styles.TravelPreferencesCenter}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>First Name *</h4>
                                        <input
                                            className={styles.inputField}
                                            type="text"
                                            placeholder="Enter First Name"
                                        />
                                    </div>
                                    <div className={styles.TravelPreferencesCenter}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>Email Address *</h4>
                                        <input
                                            className={styles.inputField}
                                            type="text"
                                            placeholder="Enter Email Address"
                                        />
                                    </div>
                                    <div className={styles.TravelPreferencesCenter}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>Phone Number *</h4>
                                        <input
                                            className={styles.inputField}
                                            type="text"
                                            placeholder="Enter Phone Number"
                                        />
                                    </div>

                                    <div className={styles.section}>
                                        <h4 className={styles.TravelPreferencesSubHeading}>HOTEL CATEGORY</h4>
                                        <div className={styles.hotelCategory}>
                                            {['Phone Call', 'WhatsApp', 'Email'].map((c) => (
                                                <button key={c} className={`${styles.categoryOption} ${hotelCategory.includes(c) ? styles.activeCategory : ''}`} onClick={() => toggleHotelCategory(c)}>{c}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            )}

                            <div className={styles.TravelPreferencesButtonContainer}>
                                <div className={styles.TravelPreferencesBackButton} onClick={handleBack}>
                                    <div className={styles.arrowCont}>
                                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.55414 4.51888L12.0034 4.51889L12.0034 5.85202L2.55461 5.85248L6.13021 9.42808L5.1874 10.3709L0.00195277 5.18545L5.1874 -2.41939e-06L6.13021 0.942805L2.55414 4.51888Z" fill="#A5A5A5" />
                                        </svg>
                                    </div>

                                    <span className={styles.backBtn}>{currentStep === 1 ? 'CLOSE' : 'BACK'}</span>

                                </div>
                                <button className={styles.TravelPreferencesNextButton} onClick={handleNext}>{currentStep === 3 ? 'CONFIRM' : 'CONTINUE'}</button>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomItinerary;
