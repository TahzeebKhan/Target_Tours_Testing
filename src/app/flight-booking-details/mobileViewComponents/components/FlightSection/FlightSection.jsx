import React from "react";
import styles from "./FlightSection.module.css";
import FlightFacilities from "../flightFacilities/FlightFacilities";

const defaultFlight = {
  type: "DEPARTURE",
  airline: {
    name: "Garuda Indonesia",
    code: "6E-541",
    logo: "/images/GarudaIndonesia.png",
  },
  aircraft: "Boeing 737",
  cabinClass: "Economy",
  fareType: "Flexi Plus Fare",
  date: "Thu, 06 Jul 2025",

  departure: {
    time: "06:00",
    city: "Jakarta (JKTC)",
  },

  arrival: {
    time: "07:40",
    city: "Surabaya (SUB)",
  },

  duration: {
    hours: "01",
    minutes: "50",
  },

  stops: "Direct",

  facilities: [
    "Baggage 20 kg, Cabin Baggage 7kg",
    "In-flight entertainment",
    "In-flight meal",
    "Power & USB Port",
  ],
};

const FlightSection = ({ flight }) => {
  // 👉 props aaye to use karo, warna default
  const flightData = flight ?? defaultFlight;

  return (
    <div className={styles.FlightSection}>
      <h2 className={styles.heading}>{flightData.type}</h2>

      <div className={styles.FlightSectionDetails}>
        <div className={styles.FlightSectionDetailsTop}>
          {/* TOP INFO */}
          <div className={styles.aboutFlightContainer}>
            <div className={styles.aboutFlightContainerLeft}>
              <img
                className={styles.flightIcon}
                src={flightData.airline.logo}
                alt={flightData.airline.name}
              />

              <div className={styles.flightInfoTextContainer}>
                <div className={styles.flightInfoTextTitle}>
                  {flightData.airline.name}
                  <span> ({flightData.airline.code})</span>
                </div>

                <div className={styles.flightInfoTextChips}>
                  {flightData.aircraft}
                </div>
              </div>
            </div>

            <div className={styles.aboutFlightContainerRight}>
              <div className={styles.flightInfomClass}>
                <div className={styles.economyChip}>
                  {flightData.cabinClass}
                </div>
                <div className={styles.flexiPlusFare}>
                  {flightData.fareType}
                </div>
              </div>

              <div className={styles.dashedLine}></div>

              <span className={styles.flightDate}>
                {flightData.date}
              </span>
            </div>
          </div>

          {/* TIMELINE */}
          <div className={styles.flightDateTimeLineContainer}>
            <div className={styles.flightDateTimeLine}>
              <div className={styles.flightDateTimeLineLeft}>
                <span className={styles.time}>
                  {flightData.departure.time}
                </span>

                <div className={styles.flightAnimation}>
                  <div className={styles.dotDashed}>
                    <div className={styles.dot}></div>
                    <img src="/icons/flightDash.svg" alt="" />
                  </div>

                  <img
                    className={styles.flightIconSvg}
                    src="/icons/flightIcon.svg"
                    alt=""
                  />

                  <div className={styles.dotDashed}>
                    <img src="/icons/flightDash.svg" alt="" />
                    <div className={styles.dot}></div>
                  </div>
                </div>

                <span className={styles.time}>
                  {flightData.arrival.time}
                </span>
              </div>

              <div className={styles.flightDateTimeLineRight}>
                <span className={styles.airPortName}>
                  {flightData.departure.city}
                </span>

                <div className={styles.flightDateTimeLineRightDetails}>
                  <p>
                    {flightData.duration.hours} <span>h</span>{" "}
                    {flightData.duration.minutes} <span>m</span>
                  </p>

                  <div className={styles.smallDot}></div>

                  <span className={styles.direct}>
                    {flightData.stops}
                  </span>
                </div>

                <span className={styles.airPortName}>
                  {flightData.arrival.city}
                </span>
              </div>
            </div>
          </div>
        </div>
        <FlightFacilities />
      </div>

      
    </div>
  );
};

export default FlightSection;
