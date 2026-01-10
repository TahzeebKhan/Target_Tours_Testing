"use client";
import React from "react";
import styles from "./FlightDetailsCard.module.css";
import FlightTimingDetail from "../../flightTimingDetails/FlightTimingDetail";

const FlightDetailsCard = ({ flight }) => {
  const { outbound, inbound, fare } = flight;

  return (
    <div className={styles.mobileFlightContainer}>
      {/* ===== OUTBOUND HEADER ===== */}
      <div className={styles.flightDetails}>
        <div className={styles.flightDetailsLeft}>
          <img
            className={styles.flightLogo}
            src={outbound.airlines[0].logo}
            alt={outbound.airlines[0].name}
          />
          <div className={styles.flightDetailsLeftText}>
            <span className={styles.flightName}>
              {outbound.airlines[0].name}
            </span>
            <span className={styles.flightCode}>
              ({outbound.airlines[0].code})
            </span>
          </div>
        </div>

        <div className={styles.bookingPrice}>{fare.totalFare}</div>
      </div>

      {/* ===== DEPART LABEL ===== */}
      <div>
        <div className={styles.depart}>
          {/* <span className={styles.bold}>DEPART</span>&nbsp;&nbsp; */}
          <span>{outbound.dateLabel}</span>
          <span>{outbound.dateLabel}</span>
        </div>

        <FlightTimingDetail flight={outbound} />
      </div>

      <div className={styles.border} />

      {/* ===== RETURN HEADER ===== */}
      <div className={styles.flightDetails}>
        <div className={styles.flightDetailsLeft}>
          <img
            className={styles.flightLogo}
            src={inbound.airlines[0].logo}
            alt={inbound.airlines[0].name}
          />
          <div className={styles.flightDetailsLeftText}>
            <span className={styles.flightName}>
              {inbound.airlines[0].name}
            </span>
            <span className={styles.flightCode}>
              ({inbound.airlines[0].code})
            </span>
          </div>
        </div>
      </div>

      {/* ===== RETURN LABEL ===== */}
      <div>
        <div className={styles.depart}>
          <span>{outbound.dateLabel}</span>
          <span>{outbound.dateLabel}</span>
        </div>

        <FlightTimingDetail flight={inbound} />
      </div>
    </div>
  );
};

export default FlightDetailsCard;
