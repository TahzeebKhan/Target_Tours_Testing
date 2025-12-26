"use client";
import React from "react";
import BookingStepper from "./components/BookingStepper";
import PassengerDetails from "./components/passengerDetails/PassengerDetails";
import { useFlightBooking } from "./FlightBookingContext";
import styles from "./page.module.css";

const FlightBookingDetailsPage = () => {
  const { currentStep, setCurrentStep } = useFlightBooking();
  return (
    <div className="w-full">
      {/* <BookingStepper currentStep={2} /> */}
      {currentStep === 2 && <PassengerDetails />}
      {currentStep === 3 && (
        <>
          3rd step
          <div
            onClick={() => setCurrentStep(4)}
            className={styles.continueButtonContainer}
          >
            <button className={styles.continueButton}>CONTINUE</button>
          </div>
        </>
      )}
      {currentStep === 4 && (
        <>
          4th step
          <div
            onClick={() => setCurrentStep(5)}
            className={styles.continueButtonContainer}
          >
            <button className={styles.continueButton}>CONTINUE</button>
          </div>
        </>
      )}{" "}
      {currentStep === 5 && (
        <>
          5th step
          <div
            onClick={() => setCurrentStep(6)}
            className={styles.continueButtonContainer}
          >
            <button className={styles.continueButton}>CONTINUE</button>
          </div>
        </>
      )}
      {currentStep === 6 && <>6th step</>}
    </div>
  );
};

export default FlightBookingDetailsPage;
