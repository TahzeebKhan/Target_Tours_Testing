"use client";
import React, { useEffect, useState } from "react";
import styles from "./PassengerDetailsMobile.module.css";
import FlightTimeline from "../components/flightTimeline/FlightTimeline";
import FlightTabs from "../components/FlightTabs/FlightTabs";
import FlightSection from "../components/FlightSection/FlightSection";
import TravelInsuranceOption from "../../components/passengerDetails/fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "../../components/passengerDetails/fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import { useFlightBooking } from "../../FlightBookingContext";
import FareDetailsPop from "../components/fareDetailsPop/FareDetailsPop";
const PassengerDetailsMobile = () => {
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showFareDetailsPopup, setShowFareDetailsPopup] = useState(false);


  const { setCurrentStep } = useFlightBooking();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const returnFlightData = {
    type: "RETURN",
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

  const flight = {
    departure: {
      date: "THU, 18 DEC 2025",
      time: "06:45",
      airport: "DEL - DELHI",
      terminal: "Terminal T2",
      city: "Delhi, India",
    },

    arrival: {
      date: "THU, 18 DEC 2025",
      time: "08:00",
      airport: "HKT - PHUKET CITY",
      terminal: "Terminal T3",
      city: "Phuket City, Thailand",
    },

    duration: {
      hours: 1,
      minutes: 50,
    },

    stops: "1 Stop",
  };

  return (
    <div className={styles.container}>
      <div className={styles.tripDetailsContainer}>
        <div className={styles.tripDetailsHeader}>
          <img src="/icons/leftArrowTrip.svg" alt="" />
          <p className={styles.tripDetails}>Trip Details</p>
        </div>
      </div>
      <div
        className={`${styles.tripDetailsContainer} ${showStickyHeader ? styles.stickyVisible : styles.stickyHidden
          }`}
      >
        <div className={styles.tripDetailsHeader}>
          <img src="/icons/leftArrowTrip.svg" alt="" />
          <div
            className={`${styles.TripCardHeader} ${styles.TripCardHeaderNav}`}
          >
            <div className={styles.TripCardHeaderDetails}>
              <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span>

              <img src="/icons/right-arrow.svg" alt="" />
              <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span>
            </div>

            <div className={styles.TripCardHeaderBookingDate}>
              <p>Wed, 03 Dec</p>
              <p>
                <div className={styles.navDot}></div>1 Traveller
              </p>
              <p>
                <div className={styles.navDot}></div>Economy
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.TripCardContainer}>
        <div className={styles.TripCard}>
          <div className={styles.TripCardHeader}>
            <div className={styles.TripCardHeaderDetails}>
              <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span>

              <img src="/icons/right-arrow.svg" alt="" />
              <p className={styles.TripCardHeaderDetailsItemText}>New Delhi</p>
              <span className={styles.TripCardHeaderDetailsItemCode}>
                (DEL)
              </span>
            </div>
            <div className={styles.TripCardHeaderDate}>Wed-11 Feb 2026</div>
          </div>
          <div className={styles.TripFlightDetailsCard}>
            <div className={styles.TripFlightDetailsCardCont}>
              <div className={styles.TripFlightDetailsCardImage}>
                <img src="/images/Flight.png" alt="" />
              </div>
              <div className={styles.AirLineDetails}>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineDetailsItemText}>
                    Air India
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineCode}>AI2380</span>
                </div>
                <div className={styles.AirLineDetailsItem}>
                  <span className={styles.AirLineBoeing}>
                    Boeing 787-9 Dreamliner
                  </span>
                  <div className={styles.dot}></div>
                  <span className={styles.AirLineDetailsItemCode}>
                    Economy Class
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.br}></div>
            <FlightTimeline flight={flight} />
            <div className={styles.br}></div>

            <div className={styles.FareDetailsTag}>
              <span>Fare Details</span>
              <div className={styles.blueDot}></div>
              <span>Baggage Rules</span>
            </div>
          </div>
        </div>
        {/* <div> */}
        <FlightTabs onFlightDetailsClick={() => setShowFareDetailsPopup(true)} />
          {showFareDetailsPopup && (
            <FareDetailsPop onFlightDetailsClick={() => setShowFareDetailsPopup(false)} />
          )}
        {/* </div> */}

        <div className={styles.flightDepartureReturenDetailsContianerWrapper}>
          <div className={styles.flightDepartureReturenDetailsContianer}>
            <FlightSection />
            <div className={styles.br}></div>

            <FlightSection flight={returnFlightData} />
          </div>

          <div className={styles.travelInsuranceContainer}>
            <h2 className={styles.travelInsuranceHeading}>
              Add Travel Insurance (₹399/Person)
            </h2>
            <div>
              <TravelInsuranceOption />
            </div>
          </div>

          <div className={styles.travelInsuranceContainer}>
            <h2 className={styles.travelInsuranceHeading}>
              Cancellation & Date Change Policy
            </h2>
            <div>
              <CancellationPenalty />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {/* LEFT */}
        <div className={styles.footerContainer}>
          <div className={styles.amountSection}>
            <div className={styles.label}>
              Total Amount
              <span className={styles.infoIcon}>!</span>
            </div>
            <div className={styles.amount}>₹ 66,945</div>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => setCurrentStep(3)}
            className={styles.continueBtn}
          >
            CONTINUE BOOKING
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsMobile;
