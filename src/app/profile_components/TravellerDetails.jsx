"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./TravellerDetails.module.css";

const TravellerDetails = () => {
  const [isPassengerOpen, setIsPassengerOpen] = useState(true);

  const steps = ["TRIP INFO", "CHOOSE PLAN", "PERSONAL DETAILS", "REVIEW & PAY"];

  const summaryData = {
    trip: [
      { label: "Going to", value: "Thailand" },
      { label: "Date", value: "15 Jan - 23 Jan, 2026" },
    ],
    plan: [
      { label: "Cover(s)", value: "Standard plan" },
      { label: "Medical sum insured", value: "$50,000 /person" },
    ],
  };

  const passengers = [
    {
      name: "MS PRACHI MEHTA",
      type: "Adult",
      gender: "Male",
      email: "ABC@GMAIL.COM",
      phone: "+91 7875434345",
    },
    {
      name: "MRS ARUN KUMAR (CHILD)",
      type: "Child",
      gender: "Male",
      email: "ABC@GMAIL.COM",
      phone: "+91 7875434345",
    },
    {
      name: "MRS ARUN KUMAR (CHILD)",
      type: "Child",
      gender: "Male",
      email: "ABC@GMAIL.COM",
      phone: "+91 7875434345",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <nav className={styles.stepper}>
        {steps.map((label, index) => (
          <div key={label} className={styles.stepWrapper}>
            <span className={styles.stepLabel}>{label}</span>
            <div
              className={`${styles.stepDivider} ${
                index <= 3 ? styles.stepDividerActive : ""
              }`}
            />
          </div>
        ))}
      </nav>

      <header className={styles.header}>
        <h1 className={styles.mainTitle}>REVIEW AND PAYMENT</h1>
      </header>

      {/* Trip Summary Card */}
      <section className={styles.card}>
        <div className={styles.summaryGroup}>
          <h2 className={styles.sectionTitle}>TRIP SUMMARY</h2>
          {summaryData.trip.map((item, idx) => (
            <div key={idx} className={styles.summaryRow}>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.summaryGroup}>
          <h2 className={styles.sectionTitle}>PLAN DETAILS</h2>
          {summaryData.plan.map((item, idx) => (
            <div key={idx} className={styles.summaryRow}>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Passenger Information Card */}
      <section className={styles.card}>
        <button
          className={styles.accordionHeader}
          onClick={() => setIsPassengerOpen(!isPassengerOpen)}
        >
          <h2 className={styles.sectionTitle}>PASSENGER INFORMATION</h2>
          <div className={`${styles.arrow} ${isPassengerOpen ? styles.arrowUp : ""}`}>
             <Image src="/icons/mobile-arrow-down.svg" alt="toggle" width={18} height={18} />
          </div>
        </button>

        {isPassengerOpen && (
          <div className={styles.passengerList}>
            {passengers.map((person, index) => (
              <div key={index} className={styles.passengerItem}>
                <div className={styles.passengerMain}>
                  <div className={styles.nameBlock}>
                    <h3 className={styles.passengerName}>{person.name}</h3>
                    <p className={styles.passengerMeta}>
                      {person.type} • {person.gender}
                    </p>
                  </div>
                  <div className={styles.contactBlock}>
                    <p className={styles.emailText}>{person.email}</p>
                    <p className={styles.phoneText}>{person.phone}</p>
                  </div>
                </div>
                {index !== passengers.length - 1 && (
                  <div className={styles.dashedDivider} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TravellerDetails;