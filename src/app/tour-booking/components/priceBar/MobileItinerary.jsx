"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import styles from "./MobileItinerary.module.css";

const MobileItinerary = ({ hotel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [travelDateType, setTravelDateType] = useState(null);
  const [departureCity, setDepartureCity] = useState("");
  const [hotelCategory, setHotelCategory] = useState("Standard");
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Slider State for Step 2
  const [minPrice, setMinPrice] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [notes, setNotes] = useState("");
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    email: "",
    phone: "",
  });
  const [contactPreference, setContactPreference] = useState("Email");

  const addonOptions = [
    "Cruise",
    "Safari",
    "Adventure",
    "Cultural",
    "Wine & Dine",
    "Photography",
  ];

  const toggleAddon = (name) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((s) => s + 1);
    else {
      setIsOpen(false);
      setCurrentStep(1);
    }
  };

  const MIN = 5000;
  const MAX = 100000;
  const GAP = 5000;
  const STEP = 1000;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.popupOverlay}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            className={styles.popupCard}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className={styles.popupHeader}>
              <div className={styles.stepHeader}>
                <span className={styles.stepLabel}>CUSTOM ITINERARY</span>
                <h4 className={styles.stepNumber}>STEP {currentStep}-3</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.scrollableContent}>
              <div className={styles.headingDiv}>
                <h3 className={styles.mainHeading}>
                  {currentStep === 1
                    ? "Travel Preferences"
                    : "Customize Your Experience"}
                </h3>
                <p className={styles.subText}>
                  {currentStep === 1
                    ? "Tell us about your ideal travel dates and departure details"
                    : "Tailor your journey to match your preferences"}
                </p>
              </div>

              {currentStep === 1 && (
                <div className={styles.formSection}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>TRAVEL DATES</label>
                    <div className={styles.tabGrid}>
                      <div
                        className={`${styles.tabItem} ${
                          travelDateType === "fixed" ? styles.activeTab : ""
                        }`}
                        onClick={() => setTravelDateType("fixed")}
                      >
                        <Image
                          src="/icons/blackCalendar.svg"
                          width={20}
                          height={20}
                          alt="cal"
                        />
                        <span>Fixed Dates</span>
                      </div>
                      <div
                        className={`${styles.tabItem} ${
                          travelDateType === "flexible" ? styles.activeTab : ""
                        }`}
                        onClick={() => setTravelDateType("flexible")}
                      >
                        <Image
                          src="/icons/blackCalendar.svg"
                          width={20}
                          height={20}
                          alt="cal"
                        />
                        <span>Flexible Dates</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>DEPARTURE CITY</label>
                    <input
                      className={styles.textInput}
                      placeholder="e.g., New York, London, Singapore"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.formSection}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>HOTEL CATEGORY</label>
                    <div className={styles.buttonGrid}>
                      {["Standard", "Premium", "Luxury"].map((cat) => (
                        <button
                          key={cat}
                          className={`${styles.gridBtn} ${
                            hotelCategory === cat ? styles.activeGridBtn : ""
                          }`}
                          onClick={() => setHotelCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      EXPERIENCE ADD-ONS
                    </label>
                    <div className={styles.pillContainer}>
                      {addonOptions.map((addon) => (
                        <button
                          key={addon}
                          className={`${styles.pill} ${
                            selectedAddons.includes(addon)
                              ? styles.activePill
                              : ""
                          }`}
                          onClick={() => toggleAddon(addon)}
                        >
                          {addon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      EXPERIENCE ADD-ONS
                    </label>
                    <div className={styles.rangeWrapper}>
                      <div className={styles.rangeContainer}>
                        {/* Track */}
                        <div className={styles.sliderTrack} />

                        {/* Active range */}
                        <div
                          className={styles.sliderRange}
                          style={{
                            left: `${((minPrice - MIN) / (MAX - MIN)) * 100}%`,
                            right: `${
                              100 - ((maxPrice - MIN) / (MAX - MIN)) * 100
                            }%`,
                          }}
                        />

                        {/* Min thumb */}
                        <input
                          type="range"
                          min={MIN}
                          max={MAX}
                          step={STEP}
                          value={minPrice}
                          onChange={(e) => {
                            const value = Math.min(
                              Number(e.target.value),
                              maxPrice - GAP
                            );
                            setMinPrice(value);
                          }}
                          className={styles.rangeInput}
                          style={{ zIndex: minPrice > MAX - GAP ? 5 : 4 }}
                        />

                        {/* Max thumb */}
                        <input
                          type="range"
                          min={MIN}
                          max={MAX}
                          step={STEP}
                          value={maxPrice}
                          onChange={(e) => {
                            const value = Math.max(
                              Number(e.target.value),
                              minPrice + GAP
                            );
                            setMaxPrice(value);
                          }}
                          className={styles.rangeInput}
                        />
                      </div>

                      <div className={styles.rangeLabels}>
                        <span>₹{minPrice.toLocaleString()}</span>
                        <span>Up ₹{maxPrice.toLocaleString()}+</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      SPECIAL REQUESTS OR NOTES
                    </label>
                    <textarea
                      className={styles.textArea2}
                      placeholder="Any special dietary requirement..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className={styles.formSection}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>FIRST NAME *</label>
                    <input
                      className={styles.textInput}
                      placeholder="Enter First Name"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>EMAIL ADDRESS *</label>
                    <input
                      className={styles.textInput}
                      placeholder="Enter Email Address"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>PHONE NUMBER *</label>
                    <input
                      className={styles.textInput}
                      placeholder="Enter Phone Number"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>HOTEL CATEGORY</label>
                    <div className={styles.buttonGrid}>
                      {["Phone Call", "WhatsApp", "Email"].map((method) => (
                        <button
                          key={method}
                          className={`${styles.gridBtn} ${
                            contactPreference === method
                              ? styles.activeGridBtn
                              : ""
                          }`}
                          onClick={() => setContactPreference(method)}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button
                className={styles.backButton}
                onClick={() =>
                  currentStep > 1
                    ? setCurrentStep(currentStep - 1)
                    : setIsOpen(false)
                }
              >
                BACK
              </button>
              <button className={styles.continueButton} onClick={handleNext}>
                CONTINUE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileItinerary;
