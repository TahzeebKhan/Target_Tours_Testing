"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./plane.module.css";

const Plane = () => {
  // Mapping of seats to colors/states based on the provided image
  const rowData = [
    { id: 1, seats: ["grey", "grey", "grey", "grey", "grey", "grey"] },
    { id: 2, seats: ["blue", "blue", "blue", "blue", "blue", "blue"] },
    { id: 3, seats: ["blue", "blue", "blue", "blue", "taken", "blue"] },
    { id: 4, seats: ["blue", "taken", "taken", "blue", "taken", "blue"] },
    {
      id: 5,
      seats: ["purple", "purple", "purple", "purple", "purple", "purple"],
    },
    { id: 6, seats: ["purple", "xl", "xl", "xl", "xl", "purple"] },
    {
      id: 7,
      seats: ["purple", "taken", "taken", "purple", "purple", "purple"],
    },
    { id: 8, seats: ["red", "taken", "taken", "red", "red", "red"] },
    { id: "exit1", type: "exit" },
    { id: 9, seats: ["red", "red", "red", "red", "red", "red"] },
    { id: 10, seats: ["orange", "purple", "blue", "blue", "purple", "orange"] },
    {
      id: 11,
      seats: ["orange", "taken", "taken", "taken", "purple", "orange"],
    },
    {
      id: 12,
      seats: ["orange", "taken", "taken", "taken", "purple", "orange"],
    },
    { id: 13, seats: ["orange", "purple", "blue", "blue", "purple", "orange"] },
    { id: 14, seats: ["red", "red", "red", "red", "red", "red"] },
    { id: "exit2", type: "exit" },
    { id: 15, seats: ["red", "red", "red", "red", "red", "red"] },
    { id: 16, seats: ["xl", "xl", "xl", "xl", "xl", "xl"] },
    { id: 17, seats: ["black", "black", "xl", "xl", "black", "black"] },
  ];

  const [selectedSeats, setSelectedSeats] = useState(["3-A", "3-B"]);

  const toggleSeat = (rowId, colLabel, type) => {
    if (type === "taken") return;
    const seatId = `${rowId}-${colLabel}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeat = (type, rowId, index, side) => {
    const labels = side === "left" ? ["A", "B", "C"] : ["D", "E", "F"];
    const label = labels[index];
    const seatId = `${rowId}-${label}`;
    const isActive = selectedSeats.includes(seatId);

    return (
      <div
        key={seatId}
        className={`${styles.seat} ${styles[type]} ${
          isActive ? styles.active : ""
        }`}
        onClick={() => toggleSeat(rowId, label, type)}
      >
        {type === "taken" && (
          <span className={styles.icon}>
            <Image
              src="/icons/X.svg"
              alt="Unavailable"
              width={16}
              height={16}
            />
          </span>
        )}

        {type === "xl" && (
          <span className={styles.icon}>
            <Image src="/icons/XL.svg" alt="XL seat" width={18} height={18} />
          </span>
        )}

        {isActive && (
          <span className={styles.icon}>
            <Image
              src="/icons/tick.svg"
              alt="Selected"
              width={23}
              height={23}
            />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.planeBody}>
        <div className={styles.nose}>
          <Image
            src="/images/nose.svg"
            alt="Plane nose"
            width={335}
            height={148}
            priority
          />
        </div>

        {/* Labels Header */}
        <div className={styles.row}>
          <div className={styles.seatGroup}>
            <span className={styles.label}>A</span>
            <span className={styles.label}>B</span>
            <span className={styles.label}>C</span>
          </div>
          <div className={styles.rowNumberColumn}></div>
          <div className={styles.seatGroup}>
            <span className={styles.label}>D</span>
            <span className={styles.label}>E</span>
            <span className={styles.label}>F</span>
          </div>
        </div>

        {/* Rows */}
        <div className={styles.seatingArea}>
          {rowData.map((row) => {
            if (row.type === "exit") {
              return (
                <div key={row.id} className={styles.exitRow}>
                  <div className={styles.exitSide}>
                    <div className={styles.exitLine}></div>
                    <span className={styles.exitText}>EXIT</span>
                  </div>
                  <div className={styles.exitSide}>
                    <span className={styles.exitText}>EXIT</span>
                    <div className={styles.exitLine}></div>
                  </div>
                </div>
              );
            }

            return (
              <div key={row.id} className={styles.row}>
                {/* Left Block */}
                <div className={styles.seatGroup}>
                  {row.seats
                    .slice(0, 3)
                    .map((type, i) => renderSeat(type, row.id, i, "left"))}
                </div>

                {/* Center Row Number */}
                <div className={styles.rowNumberColumn}>
                  <span className={styles.rowNumber}>{row.id}</span>
                </div>

                {/* Right Block */}
                <div className={styles.seatGroup}>
                  {row.seats
                    .slice(3, 6)
                    .map((type, i) => renderSeat(type, row.id, i, "right"))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Plane;
