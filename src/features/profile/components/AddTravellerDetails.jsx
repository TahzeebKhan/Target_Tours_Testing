"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./AddTravellerDetails.module.css";
import TripSummaryHeader from "./TripSummaryHeader";
import BookingSummaryFooter from "./BookingSummaryFooter";
import TravellerDetails from "./TravellerDetails";
import PriceSummary from "./PriceSummary";
import AddDetails from "./AddDetails";

const AddTravellerDetails = ({ setCurrentStep }) => {
  const [travelers, setTravelers] = useState([
    { id: 1, type: "ADULT", isOpen: true },
    { id: 2, type: "CHILD", isOpen: true },
  ]);

  const steps = [
    "TRIP INFO",
    "CHOOSE PLAN",
    "PERSONAL DETAILS",
    "REVIEW & PAY",
  ];

  const STEP_ADD_TRAVELLER = 2;
  const STEP_REVIEW_PAY = 3;

  // const [currentStep, setCurrentStep] = useState(STEP_ADD_TRAVELLER);
  const [openPriceSummary, setOpenPriceSummary] = useState(false);
  const [openAddDetails, setOpenAddDetails] = useState(false);

  /* ---------- Scroll lock for Price Summary ---------- */
  useEffect(() => {
    if (openPriceSummary || openAddDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [openPriceSummary, openAddDetails]);

  /* ---------- Handlers ---------- */
  const toggleTraveler = (id) => {
    setTravelers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isOpen: !t.isOpen } : t))
    );
  };

  const addTraveler = () => {
    setTravelers((prev) => [
      ...prev,
      { id: prev.length + 1, type: "ADULT", isOpen: true },
    ]);
  };



  return (
    <>
      {/* ================= ADD TRAVELLER STEP ================= */}
      {/* {currentStep === STEP_ADD_TRAVELLER && ( */}
        <div className={styles.Maincontainer}>
        
          <div className={styles.container}>
            {/* Header */}
            <div className={styles.headerRow}>
              <h1 className={styles.mainTitle}>TRAVELER DETAILS</h1>
              <button className={styles.addBtn} onClick={addTraveler}>
                + Add Traveler
              </button>
            </div>

            {/* Traveler Forms */}
            <div className={styles.formList}>
              {travelers.map((traveler, index) => (
                <div key={traveler.id} className={styles.card}>
                  <div
                    className={styles.cardHeader}
                    onClick={() => toggleTraveler(traveler.id)}
                  >
                    <h2 className={styles.cardTitle}>
                      TRAVELER {index + 1} - {traveler.type}
                    </h2>
                    <span className={styles.toggleIcon}>
                      {traveler.isOpen ? "—" : "+"}
                    </span>
                  </div>

                  {traveler.isOpen && (
                    <div className={styles.cardBody}>
                      <div className={styles.row}>
                        <div className={styles.field}>
                          <label className={styles.label}>First Name</label>
                          <input
                            className={styles.input}
                            type="text"
                            placeholder="Enter First Name"
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Last Name</label>
                          <input
                            className={styles.input}
                            type="text"
                            placeholder="Enter Last Name"
                          />
                        </div>
                      </div>

                      <div className={styles.row}>
                        <div className={styles.field}>
                          <label className={styles.label}>Gender</label>
                          <div className={styles.selectWrapper}>
                            <select className={styles.select} defaultValue="">
                              <option value="" disabled>
                                Select
                              </option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            <div className={styles.chevron}>
                              <Image
                                src="/icons/mobile-arrow-down.svg"
                                alt="chevron"
                                width={16}
                                height={16}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Country Code</label>
                          <input
                            className={styles.input}
                            type="text"
                            placeholder="Country Code (optional)"
                          />
                        </div>
                      </div>

                      <div className={styles.row}>
                        <div className={styles.field}>
                          <label className={styles.label}>Mobile Number</label>
                          <input
                            className={styles.input}
                            type="text"
                            placeholder="Mobile number (optional)"
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Email</label>
                          <input
                            className={styles.input}
                            type="email"
                            placeholder="Email (Optional)"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <BookingSummaryFooter
            onContinue={() => setCurrentStep(4)}
            onInfoClick={() => setOpenPriceSummary(true)}
          />
        </div>
      {/* )} */}

      {/* ================= REVIEW & PAY STEP ================= */}
      {/* {currentStep === STEP_REVIEW_PAY && <TravellerDetails />} */}

      {/* ================= PRICE SUMMARY MODAL ================= */}
      {openPriceSummary && (
        <PriceSummary onClose={() => setOpenPriceSummary(false)} />
      )}

      {openAddDetails && (
        <AddDetails onClose={() => setOpenAddDetails(false)} />
      )}
    </>
  );
};

export default AddTravellerDetails;
