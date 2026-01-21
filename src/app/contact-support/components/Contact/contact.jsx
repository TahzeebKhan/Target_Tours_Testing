"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./contact.module.css";
import { useSupportFlow } from "@/app/context/SupportFlowContext";

const contactOptions = [
  {
    id: "flights",
    title: "FLIGHTS",
    description: "Booking, cancellation, or changes",
    icon: "/icons/flight-icon.svg",
  },
  {
    id: "hotels",
    title: "HOTELS",
    description: "Reservations and stay-related help",
    icon: "/icons/baggage-icon.svg",
  },
  {
    id: "tour_packages",
    title: "TOUR PACKAGES",
    description: "Holiday packages and itineraries",
    icon: "/icons/interruption-icon.svg",
  },
  {
    id: "travel_insurance",
    title: "TRAVEL INSURANCE",
    description: "Coverage and claims assistance",
    icon: "/icons/insurance_copy.svg",
  },
  {
    id: "payments",
    title: "PAYMENTS & REFUNDS",
    description: "Transaction and refund queries",
    icon: "/icons/payments.svg",
  },
  {
    id: "other",
    title: "OTHER ISSUES",
    description: "General support and assistance",
    icon: "/icons/other.svg",
  },
];

export default function ContactSupport({}) {
  const [selectedId, setSelectedId] = useState(null);

  const { setStep } = useSupportFlow();

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Contact Support</h1>
        <p className={styles.subtitle}>
          Get instant help from our support team for your booking or
          travel-related concerns.
        </p>
      </header>
      <div className={styles.br} />
      <div className={styles.grid}>
        {contactOptions.map((option) => (
          <div
            key={option.id}
            className={`${styles.card} ${selectedId === option.id ? styles.active : ""}`}
            onClick={() => setSelectedId(option.id)}
          >
            <div className={styles.iconWrapper}>
              <Image
                src={option.icon}
                alt={option.title}
                width={32}
                height={32}
              />
            </div>
            <div className={styles.content}>
              <h2 className={styles.cardTitle}>{option.title}</h2>
              <p className={styles.cardDescription}>{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <button
          className={styles.continueButton}
          disabled={!selectedId}
          onClick={() => {
            setStep("help");
          }}
        >
          CONTINUE
        </button>
      </footer>
    </section>
  );
}
