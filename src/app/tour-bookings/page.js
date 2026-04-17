"use client";
import React from "react";
import { useTourBooking } from "./TourBookingContext";
import styles from "./page.module.css";
import PaymentPage from "./components/paymentPage/PaymentPage";
import ReviewPage from "./components/review/ReviewPage";

const TourBookingPage = () => {
  const { currentStep } = useTourBooking();
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

export default TourBookingPage;
