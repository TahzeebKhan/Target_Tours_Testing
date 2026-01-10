"use client";
import React, { useState } from "react";
import styles from "./TripCard.module.css";
import FlightTimingDetail from "../../flightTimingDetails/FlightTimingDetail";
import ExpandableTabs from "@/app/flights/components/onewayTrip/expendableTabs/ExpandableTabs";
import RoundTripExpendable from "../multiTripExpendable/MultiTripExpendable";
import MultiTripExpendable from "../multiTripExpendable/MultiTripExpendable";
const TripCard = () => {
  const [openId, setOpenId] = useState(null);

  const flight = {
    departure: {
      time: "06:45",
      city: "Jakarta (CGK)",
    },
    arrival: {
      time: "08:00",
      city: "Singapore (SIN)",
    },
    duration: {
      hours: 1,
      minutes: 50,
    },
    stops: {
      type: "Non Stop",
    },
    fare: {
      totalFare: "₹ 3,22,000",
      pricePerAdult: "₹ 12,000",
      cabinClass: "ECONOMY",
    },
  };

  return (
    <div>
      <div
        className={`${styles.card} ${
          openId === flight.id ? styles.cardOpen : ""
        }`}
      >
        <div className={styles.top}>
          <div className={styles.cardLeftMainCont}>
            <div className={styles.cardLeft}>
              <div className={styles.departContainer}>
                <div className={styles.departureDetails}>
                  {/* <div className={styles.departTextHeading}>
                                <h3>Depart</h3>
                                <span>WED, 17 DEC</span>
                            </div> */}
                  <div className={styles.departTimeContainer}>
                    <div className={styles.HeadingCont}>
                      <div className={styles.airlineLogoContainer}>
                        <img
                          className={styles.flightLogo}
                          src="/images/flightCompanyLogos/batikAirlines.png"
                          alt="img"
                        />
                      </div>

                      <h3 className={styles.ariLineName}>
                        Batik Airlines, Indones....{" "}
                        <span className={styles.ariLineNumber}>6E- 541</span>
                      </h3>
                    </div>
                    <FlightTimingDetail flight={flight} />
                  </div>
                </div>
              </div>
              <div className={styles.returnContainer}>
                <div className={styles.departureDetails}>
                  {/* <div className={styles.departTextHeading}>
                                <h3>Depart</h3>
                                <span>WED, 17 DEC</span>
                            </div> */}
                  <div className={styles.departTimeContainer}>
                    <div className={styles.HeadingCont}>
                      <div className={styles.airlineLogoContainer}>
                        <img
                          className={styles.flightLogo}
                          src="/images/flightCompanyLogos/indigo.png"
                          alt="img"
                        />
                      </div>
                      <h3 className={styles.ariLineName}>
                        Indonesia Airasia{" "}
                        <span className={styles.ariLineNumber}>6E- 541</span>
                      </h3>
                    </div>
                    <FlightTimingDetail flight={flight} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardRight}>
            <div
              className={styles.seeDetailsBtn}
              onClick={() =>
                setOpenId((prev) => (prev === flight.id ? null : flight.id))
              }
            >
              See Details
              <svg
                className={`${styles.downArrow} ${
                  openId === flight.id ? styles.rotate : ""
                }`}
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.55967 4.01408C3.47933 4.01408 3.40454 4.00126 3.33532 3.97562C3.26609 3.94997 3.20028 3.90596 3.13789 3.84357L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357C3.91906 3.90596 3.85325 3.94997 3.78402 3.97562C3.7148 4.00126 3.64001 4.01408 3.55967 4.01408Z"
                  fill="#000033"
                />
              </svg>
            </div>
            <div className={styles.fareDetails}>
              <div className={styles.totalFare}>
                <span className={styles.fareText}>{flight.fare.totalFare}</span>
                <button className={styles.viewBtn}>VIEW FARES</button>
              </div>
              <div className={styles.fareAmount}>
                <span className={styles.fare}>
                  {flight.fare.pricePerAdult}{" "}
                  <span className={styles.adult}> /ADULT</span>
                </span>
                <div className={styles.dot}></div>
                <span className={styles.economy}>{flight.fare.cabinClass}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={styles.seeDetailsBtn}
          onClick={() =>
            setOpenId((prev) => (prev === flight.id ? null : flight.id))
          }
        >
          See Details
          <svg
            className={`${styles.downArrow} ${
              openId === flight.id ? styles.rotate : ""
            }`}
            width="8"
            height="5"
            viewBox="0 0 8 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.55967 4.01408C3.47933 4.01408 3.40454 4.00126 3.33532 3.97562C3.26609 3.94997 3.20028 3.90596 3.13789 3.84357L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357C3.91906 3.90596 3.85325 3.94997 3.78402 3.97562C3.7148 4.00126 3.64001 4.01408 3.55967 4.01408Z"
              fill="#000033"
            />
          </svg>
        </div>
      </div>
      {/* ===== EXPANDABLE PANEL ===== */}
      <div
        className={`${styles.expandWrap} ${
          openId === flight.id ? styles.open : ""
        }`}
      >
        <MultiTripExpendable />
      </div>
    </div>
  );
};

export default TripCard;
