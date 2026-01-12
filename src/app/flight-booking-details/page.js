"use client";
import React from "react";
import BookingStepper from "./components/BookingStepper";
import PassengerDetails from "./components/passengerDetails/PassengerDetails";
import { useFlightBooking } from "./FlightBookingContext";
import styles from "./page.module.css";
import BaggageDetails from "./components/baggageDetails/BaggageDetails";
import MealsDetails from "./components/mealsDetails/MealsDetails";
import SeatingDetails from "./components/seatingDetails/SeatingDetails";
import PaymentPage from "./components/paymentPage/PaymentPage";

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
        <SeatingDetails/>
      )}
      {currentStep === 6 && (
        <>
          <PaymentPage />
        </>
      )}
    </div>
  );
};

export default FlightBookingDetailsPage;
