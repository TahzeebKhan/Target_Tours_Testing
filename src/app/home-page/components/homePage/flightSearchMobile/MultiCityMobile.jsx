"use client";
import React from "react";
import { ChevronDown, Search } from "lucide-react";
import styles from "./MultiCityMobile.module.css";

const MultiCityMobile = ({
  multiFlights,
  setMultiFlights,
  setActiveFlightIndex,

  setOpenFrom,
  setOpenTo,
  setOpenCalendar,
  setCalendarType,

  setOpenPassengers,
  setOpenSeatClass,
  // ⛔ swapLocations is NOT used as requested

  passengerText,
  travelClass,
  onSearch,
  isSearchLoading = false,
  formatDate,
}) => {
  // ✅ LOCAL swap function (does NOT touch parent)
  const handleSwap = (index) => {
    setMultiFlights((prev) =>
      prev.map((leg, i) =>
        i === index
          ? {
              ...leg,
              from: leg.to || "",
              to: leg.from || "",
            }
          : leg
      )
    );
  };

  return (
    <div className={styles.container}>
      {multiFlights.map((flight, index) => (
        <div key={index} className={styles.flightBlock}>
          <h3 className={styles.flightTitle}>FLIGHT {index + 1}</h3>

          {/* FROM / TO */}
          <div className={styles.routeRow}>
            <div
              className={styles.field}
              onClick={() => {
                setActiveFlightIndex(index);
                setOpenFrom(true);
              }}
            >
              <label className={styles.label}>FROM</label>
              <div className={styles.value}>
                {flight.from || "DEPARTURE"}
              </div>
            </div>

            {/* 🔁 SWAP */}
            <div
              className={styles.swapCircle}
              onClick={() => handleSwap(index)}
            >
              <img src="/icons/leftRrighArrow.svg" alt="swap" />
            </div>

            <div
              className={`${styles.field} ${styles.extraField}`}
              onClick={() => {
                setActiveFlightIndex(index);
                setOpenTo(true);
              }}
            >
              <label className={styles.label}>TO</label>
              <div className={styles.value}>
                {flight.to || "DESTINATION"}
              </div>
            </div>
          </div>

          {/* DATE */}
          <div
            className={styles.fullField}
            onClick={() => {
              setActiveFlightIndex(index);
              setCalendarType("departure");
              setOpenCalendar(true);
            }}
          >
            <label className={styles.label}>DEPARTURE DATE</label>
            <div className={styles.rowBetween}>
              <span className={styles.value}>
                {formatDate(flight.departureDate) || "START DATE"}
              </span>
              <img
                src="/icons/multi-city-calendar.svg"
                alt="calendar"
                className={styles.icon}
              />
            </div>
          </div>
        </div>
      ))}

      {/* PASSENGERS */}
      <div className={styles.fullField} onClick={() => setOpenPassengers(true)}>
        <label className={styles.label}>PASSENGERS</label>
        <div className={styles.rowBetween}>
          <span className={styles.value}>{passengerText}</span>
          <ChevronDown size={20} className={styles.icon} />
        </div>
      </div>

      {/* SEAT CLASS */}
      <div className={styles.fullField} onClick={() => setOpenSeatClass(true)}>
        <label className={styles.label}>SEAT CLASS</label>
        <div className={styles.rowBetween}>
          <span className={styles.value}>{travelClass}</span>
          <ChevronDown size={20} className={styles.icon} />
        </div>
      </div>

      {/* SEARCH */}
      <button
        className={styles.searchButton}
        onClick={onSearch}
        disabled={isSearchLoading}
      >
        <Search size={20} className={styles.searchIcon} />
        {isSearchLoading ? "SEARCHING..." : "SEARCH FLIGHT"}
      </button>
    </div>
  );
};

export default MultiCityMobile;
