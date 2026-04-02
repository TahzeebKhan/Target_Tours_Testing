"use client";

import { useState } from "react";
import styles from "./below_plane.module.css";
import Image from "next/image";


const legendData = [
  { id: "free", label: "Free", color: "rgba(0, 212, 146, 1)" }, // Teal/Green
  { id: "low", label: "₹ 0-525", color: "rgba(142, 197, 255, 1)" }, // Light Blue
  { id: "mid", label: "₹ 578-1103", color: "rgba(194, 122, 255, 1)" }, // Purple
  { id: "exit", label: "Exit Row Seats", color: "rgba(248, 113, 113, 1)" }, // Red/Coral
  { id: "non", label: "Non Reclining", color: "rgba(16, 24, 40, 1)" }, // Dark/Black
  { id: "high", label: "₹ 1200-1503", color: "rgba(251, 146, 60, 1)" }, // Orange
  { id: "xl", label: "Extra Legroom", type: "xl" }, // Bordered Box
];

export default function BelowPlane() {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const passengerData = [
    { id: 1, name: "Demian", seat: "No Seat" },
    { id: 2, name: "Satria", seat: "2A" },
  ];

  const [activePassenger, setActivePassenger] = useState(2);

  return (
    <div className={styles.container}>
      <div className={styles.gridWrapper}>
        {legendData.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.legendItem} ${
              activeIndex === index ? styles.active : ""
            }`}
            onClick={() => handleToggle(index)}
          >
            <div
              className={styles.swatch}
              style={{ backgroundColor: item.color || "transparent" }}
            >
              {item.type === "xl" && <span className={styles.xlText}>XL</span>}
            </div>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
      {/* Passenger Selection Section */}
      <div className={styles.mainContainer}>
        {/* Header */}
        <div className={styles.headerRow}>
          <h2 className={styles.title}>SELECT YOUR SEAT</h2>
          <p className={styles.selectionStatus}>1 out of 1 Selected</p>
        </div>

        {/* Passenger Grid */}
        <div className={styles.passengerGrid}>
          {passengerData.map((p) => (
            <div
              key={p.id}
              className={`${styles.passengerCard} ${
                activePassenger === p.id ? styles.activeCard : ""
              }`}
              onClick={() => setActivePassenger(p.id)}
            >
              <div className={styles.avatarBox}>
                <Image
                  src="/icons/User_copy.svg"
                  alt="passenger"
                  width={20}
                  height={20}
                />
              </div>

              <div className={styles.passengerDetails}>
                <span className={styles.passengerLabel}>
                  Seat Passenger {p.id}
                </span>
                <span className={styles.passengerSub}>
                  {p.name}
                  <span className={styles.separator}>•</span>
                  {p.seat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
