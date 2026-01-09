"use client";
import { useState } from "react";
import { useFlightBooking } from "../../FlightBookingContext";
import styles from "./PaymentPage.module.css";
import TripSummaryExpandable from "./components/TripSummaryExpandable";
import { tripSummaryData } from "./components/dummyData";
import PassengerInfo from "./components/PassengerInfo";
import ExtrasSummary from "./components/ExtrasSummary";
import PayWithOptions from "./components/PayWithOptions";
const PaymentPage = () => {
  const { setCurrentStep } = useFlightBooking();
  const [openTab, setOpenTab] = useState("passengerInfo");

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>Review and Payment</h2>
          </div>
        </div>


        <div className={styles.tripSummaryContainer}>
          <div className={styles.tripSummaryTop}>
            <h3 className={styles.tripSummaryHeading}>Trip Summary</h3>
            <div className={styles.locationWrapper}>
              <div className={styles.locationContainer}>
                <span className={styles.goingTo}>Going to</span>
                <span className={styles.location}>Thailand</span>
              </div>
              <div className={styles.br}></div>
              <div className={styles.locationContainer}>
                <span className={styles.goingTo}>Date</span>
                <span className={styles.location}>15 Jan - 23 Jan, 2026</span>
              </div>
            </div>
          </div>
          <div className={styles.tripSummaryTop}>
            <h3 className={styles.tripSummaryHeading}>Plan details</h3>
            <div className={styles.locationWrapper}>
              <div className={styles.locationContainer}>
                <span className={styles.goingTo}>Cover(s)</span>
                <span className={styles.location}>Standard plan</span>
              </div>
              <div className={styles.br}></div>
              <div className={styles.locationContainer}>
                <span className={styles.goingTo}>Medical sum insured</span>
                <span className={styles.location}>$50,000 /person</span>
              </div>
            </div>
          </div>
        </div>


        {/* Passenger info */}
        <div className={styles.flightExpandableContainer}>
          <div
            className={styles.flightExpandableCard}
            onClick={() => toggleTab("passengerInfo")}
          >
            <h3 className={styles.flightExpandableHeader}>
              Passenger information
            </h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${openTab === "passengerInfo" ? styles.arrowRotate : ""
                }`}
            />
          </div>

          <div
            className={`${styles.expandWrap} ${openTab === "passengerInfo" ? styles.expandOpen : ""
              }`}
          >
            <PassengerInfo />
          </div>
        </div>

        {/* <div
          onClick={() => setCurrentStep(3)}
          className={styles.continueButtonContainer}
        >
          <button className={styles.continueButton}>CONTINUE</button>
        </div> */}
      </div>
    </>
  );
};

export default PaymentPage;
