"use client";
import React from "react";
import BookingStepper from "./components/BookingStepper";
import PassengerDetails from "./components/passengerDetails/PassengerDetails";
import { useFlightBooking } from "./FlightBookingContext";
import styles from "./page.module.css";
import BaggageDetails from "./components/baggageDetails/BaggageDetails";
import MealsDetails from "./components/mealsDetails/MealsDetails";

const FlightBookingDetailsPage = () => {
  const { currentStep, setCurrentStep } = useFlightBooking();
  return (
    <div className="w-full">
      {/* <BookingStepper currentStep={2} /> */}
      {currentStep === 2 && <PassengerDetails />}
      {currentStep === 3 && (
       <BaggageDetails/>
      )}
      {currentStep === 4 && (
        <MealsDetails/>
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
