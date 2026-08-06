"use client";
import { createContext, useContext, useMemo, useState } from "react";

const FlightBookingContext = createContext(null);

export function FlightBookingProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(2);
  const [travelerDetails, setTravelerDetails] = useState([
    {
      id: 1,
      isOpen: true,
      first_name: "",
      last_name: "",
      gender: "",
      country_code: "+91",
      phone_no: "",
      email: "",
    },
    {
      id: 2,
      isOpen: true,
      first_name: "",
      last_name: "",
      gender: "",
      country_code: "+91",
      phone_no: "",
      email: "",
    },
    {
      id: 3,
      isOpen: true,
      first_name: "",
      last_name: "",
      gender: "",
      country_code: "+91",
      phone_no: "",
      email: "",
    },
  ]);
  const [bookingContactInfo, setBookingContactInfo] = useState({
    country_code: "+91",
    mobile_number: "",
    email: "",
  });

  const [baggage, setBaggage] = useState([]);
  const [meals, setMeals] = useState([]);
  const [seats, setSeats] = useState([]);

  const prices = useMemo(() => {
    const baseFare = 5200;
    const baggagePrice = baggage.reduce((s, b) => s + b.price, 0);
    const mealsPrice = meals.reduce((s, m) => s + m.price, 0);
    const seatsPrice = seats.reduce((s, s1) => s + s1.price, 0);

    return {
      baseFare,
      baggage: baggagePrice,
      meals: mealsPrice,
      seats: seatsPrice,
      total: baseFare + baggagePrice + mealsPrice + seatsPrice,
    };
  }, [baggage, meals, seats]);

  return (
    <FlightBookingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        travelerDetails,
        setTravelerDetails,
        bookingContactInfo,
        setBookingContactInfo,

        baggage,
        setBaggage,
        meals,
        setMeals,
        seats,
        setSeats,

        prices,
      }}
    >
      {children}
    </FlightBookingContext.Provider>
  );
}

export function useFlightBooking() {
  const ctx = useContext(FlightBookingContext);
  if (!ctx) {
    throw new Error(
      "useFlightBooking must be used inside FlightBookingProvider"
    );
  }
  return ctx;
}
