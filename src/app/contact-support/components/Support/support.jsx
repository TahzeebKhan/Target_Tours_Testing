"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./support.module.css";
import { useSupportFlow } from "@/app/context/SupportFlowContext";

const supportData = [
  {
    id: "flights",
    icon: "/icons/plane-icon.svg",
    title: "FLIGHTS",
    description: "Find help with flight bookings, cancellations, and changes",
    links: [
      "How to book a flight",
      "Cancel or modify flight booking",
      "Check flight status",
      "Baggage policy and fees",
    ],
  },
  {
    id: "hotels",
    icon: "/icons/hotel-icon.svg",
    title: "HOTELS",
    description: "Get assistance with hotel reservations and stays",
    links: [
      "Hotel booking process",
      "Modify or cancel reservation",
      "Check-in and check-out policies",
      "Room upgrades and amenities",
    ],
  },
  {
    id: "tour-packages",
    icon: "/icons/package-icon.svg",
    title: "TOUR PACKAGES",
    description: "Everything you need to know about holiday packages",
    links: [
      "Browse tour packages",
      "Customize your itinerary",
      "Group booking discounts",
      "Visa and documentation help",
    ],
  },
  {
    id: "travel-insurance",
    icon: "/icons/insurance-icon.svg",
    title: "TRAVEL INSURANCE",
    description: "Protect your trip with comprehensive coverage",
    links: [
      "Types of travel insurance",
      "File an insurance claim",
      "Coverage details",
      "Insurance refund policy",
    ],
  },
  {
    id: "payments",
    icon: "/icons/payment-icon.svg",
    title: "PAYMENTS & REFUNDS",
    description: "Payment methods, refunds, and transaction issues",
    links: [
      "Payment options available",
      "Track refund status",
      "Failed transaction help",
      "EMI and wallet options",
    ],
  },
  {
    id: "booking",
    icon: "/icons/booking-icon.svg",
    title: "BOOKING & DOCUMENTS",
    description: "Manage bookings and download travel documents",
    links: [
      "View booking details",
      "Download tickets and vouchers",
      "Update passenger information",
      "Booking confirmation issues",
    ],
  },
];

export default function SupportPage({}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const { step, setStep } = useSupportFlow();

  const handleCardClick = (id) => {
    setActiveIndex(id);
  };

  return (
    <main className={styles.mainContainer}>
      <section className={styles.gridContainer}>
        {supportData.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} ${
              activeIndex === item.id ? styles.activeCard : ""
            }`}
            onClick={() => handleCardClick(item.id)}
          >
            <div className={styles.iconWrapper}>
              <Image
                className={styles.iconImg}
                src={item.icon}
                alt={item.title}
                width={32}
                height={32}
              />
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardDescription}>{item.description}</p>

              <ul className={styles.linkList}>
                {item.links.map((link, index) => (
                  <li key={index} className={styles.linkItem}>
                    {link}
                  </li>
                ))}
              </ul>
            </div>

            <button className={styles.viewArticles}>VIEW ALL ARTICLES</button>
          </div>
        ))}
      </section>

      <section className={styles.footerActions}>
        <div className={styles.footerBox}>
          <div className={styles.footerHeader}>
            <div className={styles.footerIcon}>
              <Image

                src="/icons/support-icon.svg"
                alt="Support"
                width={28}
                height={28}
              />
              
            </div>
            <div className={styles.footerTextGroup}>
              <h3 className={styles.footerTitle}>Contact Support?</h3>
              <p className={styles.footerDescription}>
                Not finding the help you need?
              </p>
              <button
                onClick={() => setStep("contact")}
                className={styles.footerButton}
              >
                CONTACT US
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footerBox}>
          <div className={styles.footerHeader}>
            <div className={styles.footerIcon}>
              <Image
                src="/icons/support-icon.svg"
                alt="Ticket"
                width={28}
                height={28}
              />
            </div>
            <div className={styles.footerTextGroup}>
              <h3 className={styles.footerTitle}>Submit a Ticket</h3>
              <p className={styles.footerDescription}>
                Prosperous impression had conviction For every delay
              </p>
              <button className={styles.footerButton}>SUBMIT TICKET</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
