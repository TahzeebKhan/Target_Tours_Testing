"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PassengerDetails from "./components/passengerDetails/PassengerDetails";
import { useFlightBooking } from "./FlightBookingContext";
import PaymentPage from "./components/paymentPage/PaymentPage";
import ExtrasStep from "./components/extrasStep/ExtrasStep";

const FlightBookingDetailsPage = () => {
  const router = useRouter();
  const { currentStep, bookingSession, bookingSessionReady } = useFlightBooking();

  useEffect(() => {
    if (!bookingSessionReady || bookingSession) return;
    router.replace("/flights");
  }, [bookingSession, bookingSessionReady, router]);

  if (!bookingSessionReady || !bookingSession) return null;

  return (
    <div className="w-full">
      {currentStep === 2 && <PassengerDetails />}
      {currentStep === 3 && <ExtrasStep />}
      {currentStep === 6 && <PaymentPage />}
    </div>
  );
};

export default FlightBookingDetailsPage;
