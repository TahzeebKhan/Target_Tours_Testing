"use client";

import React, { useState , useEffect} from "react";
import Image from "next/image";
import styles from "./plane.module.css";

const Plane = ({
  callFromDesktop,
  rowData,
  selectedSeats,
  setSelectedSeats,
  toggleSeat,
  seatIdPrefix = "",
}) => {
  // Mapping of seats to colors/states based on the provided image

  const renderSeat = (seatCell, rowId, index, side) => {
    const type = typeof seatCell === "string" ? seatCell : seatCell?.type || "grey";
    const hasSeatData = typeof seatCell === "object" && Boolean(seatCell?.seatNumber);
    const labels = side === "left" ? ["A", "B", "C"] : ["D", "E", "F"];
    const label = typeof seatCell === "object" && seatCell?.column ? seatCell.column : labels[index];
    const seatId = `${seatIdPrefix}${rowId}-${label}`;
    const isActive = selectedSeats.includes(seatId);
    const seatLabel = `${rowId}${label}`;
    const seatDescription = hasSeatData
      ? `Seat ${seatLabel} • Status: ${seatCell?.statusLabel || "Unknown"}`
      : "";
    const isSelectable = hasSeatData && type !== "taken" && type !== "grey";

    return (
      <div
        key={seatId}
        className={`${styles.seat} ${styles[type]} ${styles.seatDesktop} ${
          seatCell?.isWindow ? styles.windowSeat : ""
        } ${
          isActive ? styles.active : ""
        }`}
        title={seatDescription || undefined}
        aria-label={seatDescription || `Seat ${seatLabel} not available`}
        onClick={() => {
          if (isSelectable) toggleSeat(rowId, label, type, seatIdPrefix);
        }}
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

  useEffect(()=>{
    console.log("selectedSeats",selectedSeats)
      },[selectedSeats])

  return (
    <div
      className={`${styles.container} ${
        callFromDesktop ? styles.desktopContainer : ""
      }`}
    >
      <div
        className={`${styles.planeBody} ${
          callFromDesktop ? styles.planeBodyDesktop : ""
        }`}
      >
        <div
          className={`${styles.nose} ${
            callFromDesktop ? styles.noseDesktop : ""
          }`}
        >
          <Image
            src="/images/nose.svg"
            alt="Plane nose"
            width={callFromDesktop ? 343 : 335}
            height={callFromDesktop ? 152 : 148}
            priority
          />
        </div>

        {/* Labels Header */}
        <div className={styles.row}>
          <div className={styles.seatGroup}>
            <span
              className={`${styles.label} ${
                callFromDesktop ? styles.labelDesktop : ""
              }`}
            >
              A
            </span>
            <span
              className={`${styles.label} ${
                callFromDesktop ? styles.labelDesktop : ""
              }`}
            >
              B
            </span>
            <span
              className={`${styles.label} ${
                callFromDesktop ? styles.labelDesktop : ""
              }`}
            >
              C
            </span>
          </div>
          <div className={styles.rowNumberColumn}></div>
          <div className={styles.seatGroup}>
            <span
              className={`${styles.label} ${
                callFromDesktop ? styles.labelDesktop : ""
              }`}
            >
              D
            </span>
            <span
              className={`${styles.label} ${
                callFromDesktop ? styles.labelDesktop : ""
              }`}
            >
              E
            </span>
            <span
              className={`${styles.label} ${
                callFromDesktop ? styles.labelDesktop : ""
              }`}
            >
              F
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className={`${styles.seatingArea} ${styles.seatingAreaDesktop}`}>
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
