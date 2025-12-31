"use client";

import { createContext, useContext, useState } from "react";

const TripTypeContext = createContext(null);

/**
 * Provider
 */
export function TripTypeProvider({ children }) {
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [committedSearches, setCommittedSearches] = useState({
    oneway: { from: "Jakarta", to: "Singapore" },
    round: { from: "Jakarta", to: "Singapore" },
    multi: { from: "Jakarta", to: "Singapore" },
  });

  const handleSearch = () => {
    setCommittedSearches((prev) => ({
      ...prev,
      [tripType]: { from, to },
    }));
  };

  return (
    <TripTypeContext.Provider
      value={{
        tripType,
        setTripType,
        from,
        setFrom,
        to,
        setTo,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        passengers,
        setPassengers,
        travelClass,
        setTravelClass,
        committedSearches,
        handleSearch,
      }}
    >
      {children}
    </TripTypeContext.Provider>
  );
}

/**
 * Hook
 */
export function useTripType() {
  const context = useContext(TripTypeContext);

  if (!context) {
    throw new Error("useTripType must be used inside TripTypeProvider");
  }

  return context;
}
