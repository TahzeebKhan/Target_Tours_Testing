"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./AddTravellerDetails.module.css";

const AddTravellerDetails = () => {
  const [travelers, setTravelers] = useState([
    { id: 1, type: "ADULT", isOpen: true },
    { id: 2, type: "CHILD", isOpen: true },
  ]);

  const steps = ["TRIP INFO", "CHOOSE PLAN", "PERSONAL DETAILS", "REVIEW & PAY"];

  const toggleTraveler = (id) => {
    setTravelers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isOpen: !t.isOpen } : t))
    );
  };

  const addTraveler = () => {
    const newId = travelers.length + 1;
    setTravelers((prev) => [...prev, { id: newId, type: "ADULT", isOpen: true }]);
  };

  return (
    <div className={styles.container}>
      {/* Stepper Component */}
      <nav className={styles.stepper}>
        {steps.map((label, index) => (
          <div key={label} className={styles.stepWrapper}>
            <span className={styles.stepLabel}>{label}</span>
            <div
              className={`${styles.stepDivider} ${
                index <= 2 ? styles.stepDividerActive : ""
              }`}
            />
          </div>
        ))}
      </nav>

      {/* Header Section */}
      <div className={styles.headerRow}>
        <h1 className={styles.mainTitle}>TRAVELER DETAILS</h1>
        <button className={styles.addBtn} onClick={addTraveler}>
          + Add Traveler
        </button>
      </div>

      {/* Traveler Form Cards */}
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

            <div className={`${styles.cardBody} ${traveler.isOpen ? styles.open : styles.closed}`}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>First Name</label>
                  <input className={styles.input} type="text" placeholder="Enter First Name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last Name</label>
                  <input className={styles.input} type="text" placeholder="Enter Last Name" />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Gender</label>
                  <div className={styles.selectWrapper}>
                    <select className={styles.select} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className={styles.chevron}>
                       <Image src="/icons/mobile-arrow-down.svg" alt="chevron" width={16} height={16} />
                    </div>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Country Code</label>
                  <input className={styles.input} type="text" placeholder="Country Code (optional)" />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Mobile Number</label>
                  <input className={styles.input} type="text" placeholder="Mobile number (optional)" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" placeholder="Email (Optional)" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddTravellerDetails;