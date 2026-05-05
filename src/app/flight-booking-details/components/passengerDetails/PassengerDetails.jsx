"use client";
import React, { useState } from "react";
import styles from "./PassengerDetails.module.css";
import FareDetailsExpandable from "./fareDetailsExpandable/component/fareDetailsExpandable/FareDetailsExpandable";
import TravelInsuranceOption from "./fareDetailsExpandable/component/travelInsuranceOption/TravelInsuranceOption";
import CancellationPenalty from "./fareDetailsExpandable/component/cancellationPenalty/CancellationPenalty";
import TravelerDetails from "./fareDetailsExpandable/component/travelerDetails/TravelerDetails";
import { useFlightBooking } from "../../FlightBookingContext";
import PassengerDetailsMobile from "../../mobileViewComponents/passengerDetailsMobileView/PassengerDetailsMobile";
import { getBookingDetailsView } from "@/features/flights/utils/flightBookingSession";
import { validateTravelerForm } from "@/app/flight-booking-details/utils/travelerValidation";
import { toast } from "react-toastify";

const PassengerDetails = () => {
  // 👇 default open = flight
  const {
    setCurrentStep,
    bookingSession,
    loadSsrForBooking,
    ssrLoading,
    travelerDetails,
    bookingContactDetails,
    setTravelerFormErrors,
  } = useFlightBooking();
  const [openTab, setOpenTab] = useState("flight");
  const bookingView = getBookingDetailsView(bookingSession);
  const header = bookingView?.header || {};

  const toggleTab = (tabName) => {
    setOpenTab((prev) => (prev === tabName ? null : tabName));
  };

  const handleContinue = async () => {
    const validation = validateTravelerForm({
      travelerDetails,
      bookingContactDetails,
      checklistResponse: bookingSession?.checklistResponse,
    });

    setTravelerFormErrors(validation.errors);
    if (!validation.isValid) {
      setOpenTab("travelerDetails");
      toast.error(validation.message || "Please complete traveler details.");
      return;
    }

    const loaded = await loadSsrForBooking();
    if (loaded) {
      setCurrentStep(3);
    }
  };

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.passengerDetailsHeader}>
          <div className={styles.fromToContainer}>
            <h2 className={styles.from}>
              {header.fromName || "N/A"} <span className={styles.cityCode}>({header.fromCode || "N/A"})</span>
            </h2>
            <span className={styles.to}>To</span>
            <h2 className={styles.to}>
              {header.toName || "N/A"} <span className={styles.cityCode}>({header.toCode || "N/A"})</span>
            </h2>
          </div>

          <div className={styles.aboutFlightContainerRight}>
            <span className={styles.subInfoText}>{header.date || "N/A"}</span>
            <div className={styles.dot}></div>
            <span className={styles.subInfoText}>{header.stops || "N/A"}</span>
            <div className={styles.dot}></div>
            <span className={styles.subInfoText}>{header.duration || "N/A"}</span>
            <div className={styles.dot}></div>
            <span className={styles.subInfoText}>{header.cabinClass || "N/A"}</span>
          </div>
        </div>

        {/* FLIGHT DETAILS */}
        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "flight" ? styles.flightActiveBorder : ""
          }`}
        >
          <div
            className={styles.flightExpandableCard}
            onClick={() => toggleTab("flight")}
          >
            <h3 className={styles.flightExpandableHeader}>Flight Details</h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${
                openTab === "flight" ? styles.arrowRotate : ""
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
        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "insurance" ? styles.flightActiveBorder : ""
          }`}
        >
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
              className={`${styles.arrow} ${
                openTab === "insurance" ? styles.arrowRotate : ""
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

        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "Cancellation" ? styles.flightActiveBorder : ""
          }`}
        >
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
              className={`${styles.arrow} ${
                openTab === "Cancellation" ? styles.arrowRotate : ""
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

        <div
          className={`${styles.flightExpandableContainer} ${
            openTab === "travelerDetails" ? styles.flightActiveBorder : ""
          }`}
        >
          <div
            className={styles.flightExpandableCard}
            onClick={() => toggleTab("travelerDetails")}
          >
            <h3 className={styles.flightExpandableHeader}>TRAVELER Details</h3>
            <img
              src="/icons/DownArrows.svg"
              alt=""
              className={`${styles.arrow} ${
                openTab === "travelerDetails" ? styles.arrowRotate : ""
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

        <div className={styles.continueButtonContainer}>
          <button
            type="button"
            onClick={handleContinue}
            className={styles.continueButton}
            disabled={ssrLoading}
          >
            {ssrLoading ? "LOADING..." : "CONTINUE"}
          </button>
        </div>
      </div>
      <div className={styles.mobileView}>
        <PassengerDetailsMobile />
      </div>
    </>
  );
};

export default PassengerDetails;
