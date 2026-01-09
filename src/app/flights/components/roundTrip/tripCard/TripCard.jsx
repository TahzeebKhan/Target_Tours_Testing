"use client";
import React, { useState } from "react";
import styles from "./TripCard.module.css";
import FlightTimingDetail from "../../flightTimingDetails/FlightTimingDetail";
import RoundTripExpendable from "../roundTripExpendable/RoundTripExpendable";
import OfferBanner from "../../offerComponent/OfferBanner";

const TripCard = () => {
  const [openId, setOpenId] = useState(null);

  const tripCardsData = [
    {
      id: 1,
      depart: {
        airline: {
          name: "Batik Air, Indones....",
          code: "6E- 541",
          logo: "/images/Flight1.png",
        },
        date: "WED, 17 DEC",
        flight: {
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
        },
      },
      return: {
        airline: {
          name: "Indonesia Airasia",
          code: "6E- 541",
          logo: "/images/Flight2.png",
        },
        date: "THU, 31 DEC",
        flight: {
          departure: {
            time: "06:45",
            city: "Singapore (SIN)",
          },
          arrival: {
            time: "08:00",
            city: "Jakarta (CGK)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "Non Stop",
          },
        },
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },

    {
      id: 2,
      depart: {
        airline: {
          name: "Batik Air, Indones....",
          code: "6E- 541",
          logo: "/images/Flight1.png",
        },
        date: "WED, 17 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Jakarta (CGK)",
          },
          arrival: {
            time: "08:30",
            city: "Singapore (SIN)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "1 stop via KUL",
          },
        },
      },
      return: {
        airline: {
          name: "Indonesia Airasia",
          code: "6E- 541",
          logo: "/images/Flight2.png",
        },
        date: "THU, 31 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Singapore (SIN)",
          },
          arrival: {
            time: "09:45",
            city: "Jakarta (CGK)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "Non Stop",
          },
        },
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },

    {
      id: 3,
      depart: {
        airline: {
          name: "Batik Air, Indones....",
          code: "6E- 541",
          logo: "/images/Flight1.png",
        },
        date: "WED, 17 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Jakarta (CGK)",
          },
          arrival: {
            time: "09:45",
            city: "Singapore (SIN)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "Non Stop",
          },
        },
      },
      return: {
        airline: {
          name: "Indonesia Airasia",
          code: "6E- 541",
          logo: "/images/Flight2.png",
        },
        date: "THU, 31 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Singapore (SIN)",
          },
          arrival: {
            time: "09:45",
            city: "Jakarta (CGK)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "Non Stop",
          },
        },
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
    {
      id: 4,
      depart: {
        airline: {
          name: "Batik Air, Indones....",
          code: "6E- 541",
          logo: "/images/Flight1.png",
        },
        date: "WED, 17 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Jakarta (CGK)",
          },
          arrival: {
            time: "08:30",
            city: "Singapore (SIN)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "1 stop via KUL",
          },
        },
      },
      return: {
        airline: {
          name: "Indonesia Airasia",
          code: "6E- 541",
          logo: "/images/Flight2.png",
        },
        date: "THU, 31 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Singapore (SIN)",
          },
          arrival: {
            time: "09:45",
            city: "Jakarta (CGK)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "Non Stop",
          },
        },
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
    {
      id: 5,
      depart: {
        airline: {
          name: "Batik Air, Indones....",
          code: "6E- 541",
          logo: "/images/Flight1.png",
        },
        date: "WED, 17 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Jakarta (CGK)",
          },
          arrival: {
            time: "08:30",
            city: "Singapore (SIN)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "1 stop via KUL",
          },
        },
      },
      return: {
        airline: {
          name: "Indonesia Airasia",
          code: "6E- 541",
          logo: "/images/Flight2.png",
        },
        date: "THU, 31 DEC",
        flight: {
          departure: {
            time: "09:15",
            city: "Singapore (SIN)",
          },
          arrival: {
            time: "09:45",
            city: "Jakarta (CGK)",
          },
          duration: {
            hours: 1,
            minutes: 50,
          },
          stops: {
            type: "Non Stop",
          },
        },
      },
      fare: {
        totalFare: "₹ 3,22,000",
        pricePerAdult: "₹ 12,000",
        cabinClass: "ECONOMY",
      },
    },
  ];

  return (
    <div className={styles.cardPairent}>
      {tripCardsData.map((item, index) => (
        <div key={item.id}>
          <div
            className={`${styles.card} ${
              openId === item.id ? styles.cardOpen : ""
            }`}
          >
            <div className={styles.cardLeftMainCont}>
              <div className={styles.cardLeft}>
                {/* DEPART */}
                <div className={styles.departContainer}>
                  <div className={styles.HeadingCont}>
                    <img src={item.depart.airline.logo} alt="" />
                    <h3 className={styles.ariLineName}>
                      {item.depart.airline.name}
                      <span className={styles.ariLineNumber}>
                        ({item.depart.airline.code})
                      </span>
                    </h3>
                  </div>

                  <div className={styles.departureDetails}>
                    <div className={styles.departTextHeading}>
                      <h3>Depart</h3>
                      <span>{item.depart.date}</span>
                    </div>
                    <div className={styles.departTimeContainer}>
                      <FlightTimingDetail flight={item.depart.flight} />
                    </div>
                  </div>
                </div>

                {/* RETURN */}
                <div className={styles.returnContainer}>
                  <div className={styles.HeadingCont}>
                    <img src={item.return.airline.logo} alt="" />
                    <h3 className={styles.ariLineName}>
                      {item.return.airline.name}
                      <span className={styles.ariLineNumber}>
                        ({item.return.airline.code})
                      </span>
                    </h3>
                  </div>

                  <div className={styles.departureDetails}>
                    <div className={styles.departTextHeading}>
                      <h3>Return</h3>
                      <span>{item.return.date}</span>
                    </div>
                    <div className={styles.departTimeContainer}>
                      <FlightTimingDetail flight={item.return.flight} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEE DETAILS */}
              <div
                className={styles.seeDetailsBtn}
                onClick={() =>
                  setOpenId((prev) => (prev === item.id ? null : item.id))
                }
              >
                See Details
                <svg
                  className={`${styles.downArrow} ${
                    openId === item.id ? styles.rotate : ""
                  }`}
                  width="8"
                  height="5"
                  viewBox="0 0 8 5"
                >
                  <path
                    d="M3.55967 4.01408L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357Z"
                    fill="#000033"
                  />
                </svg>
              </div>
            </div>

            {/* RIGHT FARE */}
            <div className={styles.cardRight}>
              <div
                className={styles.seeDetailsBtn}
                onClick={() =>
                  setOpenId((prev) => (prev === item.id ? null : item.id))
                }
              >
                See Details
                <svg
                  className={`${styles.downArrow} ${
                    openId === item.id ? styles.rotate : ""
                  }`}
                  width="8"
                  height="5"
                  viewBox="0 0 8 5"
                >
                  <path
                    d="M3.55967 4.01408L0.141737 0.847416C0.0494254 0.755116 0.0022032 0.639094 6.98646e-05 0.49935C-0.00207458 0.359606 0.0451476 0.241444 0.141737 0.144866C0.238314 0.0482881 0.355403 0 0.493003 0C0.630603 0 0.747692 0.0482881 0.84427 0.144866L3.55967 2.86027L6.27507 0.144866C6.36737 0.0525659 6.48339 0.0053437 6.62314 0.00319926C6.76287 0.00106593 6.88102 0.0482881 6.9776 0.144866C7.07419 0.241444 7.12249 0.358539 7.12249 0.49615C7.12249 0.63375 7.07419 0.750838 6.9776 0.847416L3.98145 3.84357Z"
                    fill="#000033"
                  />
                </svg>
              </div>
              <div className={styles.fareDetails}>
                <div className={styles.totalFare}>
                  <span className={styles.fareText}>{item.fare.totalFare}</span>
                  <button className={styles.viewBtn}>VIEW FARES</button>
                </div>
                <div className={styles.fareAmount}>
                  <span className={styles.fare}>
                    {item.fare.pricePerAdult}
                    <span className={styles.adult}> /ADULT</span>
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.economy}>{item.fare.cabinClass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EXPANDABLE */}
          <div
            className={`${styles.expandWrap} ${
              openId === item.id ? styles.open : ""
            }`}
          >
            <RoundTripExpendable />
          </div>

          {index === 2 && (
            <div className={styles.offerBannerWrap}>
              <OfferBanner />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TripCard;
