"use client";
import React, { useState } from "react";
import styles from "./PassengerDetails.module.css";
import FareDetailsExpandable from "./fareDetailsExpandable/component/fareDetailsExpandable/FareDetailsExpandable";
import TravelInsuranceOption from "./fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "./fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import TravelerDetails from "./fareDetailsExpandable/component/travelerDetails/TravelerDetails";
import { useFlightBooking } from "../../FlightBookingContext";
import { useRouter } from "next/navigation";

const PassengerDetails = () => {
  // 👇 default open = flight
  const { setCurrentStep } = useFlightBooking();
  const [openTab, setOpenTab] = useState("flight");

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.passengerDetailsHeader}>
        <div className={styles.fromToContainer}>
          <h2 className={styles.from}>
            Mumbai <span className={styles.cityCode}>(BOM)</span>
          </h2>
          <span className={styles.to}>To</span>
          <h2 className={styles.to}>
            Singapore <span className={styles.cityCode}>(SIN)</span>
          </h2>
        </div>

        <div className={styles.aboutFlightContainerRight}>
          <span className={styles.subInfoText}>Wed, 03 Dec</span>
          <div className={styles.dot}></div>
          <span className={styles.subInfoText}>Non-stop</span>
          <div className={styles.dot}></div>
          <span className={styles.subInfoText}>01 h 50 m</span>
          <div className={styles.dot}></div>
          <span className={styles.subInfoText}>Economy</span>
        </div>
      </div>

            {/* FLIGHT DETAILS */}
            <div className={`${styles.flightExpandableContainer} ${openTab === "flight" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("flight")}
                >
                    <h3 className={styles.flightExpandableHeader}>Flight Details</h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "flight" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

        <div
          className={`${styles.expandWrap} ${
            openTab === "flight" ? styles.expandOpen : ""
          }`}
        >
          <FareDetailsExpandable />
        </div>
      </div>

            {/* INSURANCE */}
            <div className={`${styles.flightExpandableContainer} ${openTab === "insurance" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("insurance")}
                >
                    <h3 className={styles.flightExpandableHeader}>
                        Add Travel Insurance (₹399/Person)
                    </h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "insurance" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

        <div
          className={`${styles.expandWrap} ${
            openTab === "insurance" ? styles.expandOpen : ""
          }`}
        >
          <TravelInsuranceOption />
        </div>
      </div>

            <div className={`${styles.flightExpandableContainer} ${openTab === "Cancellation" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("Cancellation")}
                >
                    <h3 className={styles.flightExpandableHeader}>
                        Cancellation & Date Change Policy
                    </h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "Cancellation" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

        <div
          className={`${styles.expandWrap} ${
            openTab === "Cancellation" ? styles.expandOpen : ""
          }`}
        >
          <CancellationPenalty />
        </div>
      </div>

            <div className={`${styles.flightExpandableContainer} ${openTab === "travelerDetails" ? styles.flightActiveBorder : ""}`}>
                <div
                    className={styles.flightExpandableCard}
                    onClick={() => toggleTab("travelerDetails")}
                >
                    <h3 className={styles.flightExpandableHeader}>
                        TRAVELER Details
                    </h3>
                    <img
                        src="/icons/DownArrows.svg"
                        alt=""
                        className={`${styles.arrow} ${openTab === "travelerDetails" ? styles.arrowRotate : ""
                            }`}
                    />
                </div>

        <div
          className={`${styles.expandWrap} ${
            openTab === "travelerDetails" ? styles.expandOpen : ""
          }`}
        >
          <TravelerDetails />
        </div>
      </div>

      <div
        onClick={() => setCurrentStep(3)}
        className={styles.continueButtonContainer}
      >
        <button className={styles.continueButton}>CONTINUE</button>
      </div>
    </div>
  );
};

export default PassengerDetails;
