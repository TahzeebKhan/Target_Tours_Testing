"use client";
import React from "react";
import { useFlightBooking } from "./FlightBookingContext";
import styles from "./page.module.css";
import PaymentPage from "./components/paymentPage/PaymentPage";
import ReviewPage from "./components/review/ReviewPage";

const FlightBookingDetailsPage = () => {
  const { currentStep, setCurrentStep } = useFlightBooking();
  return (
    <div className="w-full">
      {currentStep === 2 && (
        <>
          <ReviewPage/>
        </>
      )}
      
      {currentStep === 3 && (
        <>
          <PaymentPage />
         </>
      )}
    </div>
  );
};

export default FlightBookingDetailsPage;
