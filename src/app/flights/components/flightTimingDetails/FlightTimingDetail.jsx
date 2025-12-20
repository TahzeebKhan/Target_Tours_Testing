"use client";
import React from "react";
import styles from  './FlightTiming.module.css'
const FlightTimingDetail = ({ flight }) => {

  const isNonStop = flight.stops.type.toLowerCase() === "non stop";

  return (
    <div className={styles.departureDetail}>
      {/* TIME ROW */}
      <div className={styles.departureTimeContainer}>
        <div className={styles.departureTime}>
          {flight.departure.time}
        </div>

        <div className={styles.flightAnimation}>
          <div className={styles.flightDotedcontainer}>
            <div className={styles.bigDot}></div>
            <div className={styles.dashBorder}></div>
          </div>

          <img src="/icons/flightIcon.svg" alt="flight" />

          <div className={styles.flightDotedcontainer}>
            <div className={styles.dashBorder}></div>
            <div className={styles.bigDot}></div>
          </div>
        </div>

        <div className={styles.departureTime}>
          {flight.arrival.time}
        </div>
      </div>

      {/* CITY + DURATION ROW */}
      <div className={styles.departureName}>
        <span className={styles.fromName}>
          {flight.departure.city}
        </span>

        <div className={styles.priceContainer}>
          <span className={styles.duration}>
            {flight.duration.hours}
            <span className={styles.hours}> h </span>{" "}
            {flight.duration.minutes}
            <span className={styles.hours}> m </span>
          </span>

          <div className={styles.dot}></div>

          <span className={`${styles.nonStop} ${!isNonStop ? styles.withStop : ""}`}>
            {flight.stops.type}
          </span>
        </div>

        <span className={styles.fromName}>
          {flight.arrival.city}
        </span>
      </div>
    </div>
  );
};

export default FlightTimingDetail;
