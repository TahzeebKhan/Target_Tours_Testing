"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const TripTypeContext = createContext(null);

/**
 * Provider
 */
export function TripTypeProvider({ children }) {
  const searchParams = useSearchParams();

  // Helper to safely get params
  const getParam = (key) => searchParams?.get(key) || "";

  const [tripType, setTripType] = useState(getParam("tripType") || "oneway");
  const [from, setFrom] = useState(getParam("from") || "");
  const [to, setTo] = useState(getParam("to") || "");
  const [startDate, setStartDate] = useState(getParam("start") || null);
  const [endDate, setEndDate] = useState(getParam("end") || null);
  const [passengers, setPassengers] = useState({
    adult: 1,
    child: 0,
    infant: 0,
  });
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [committedSearches, setCommittedSearches] = useState({
    oneway: { from: getParam("from") || "Jakarta (CGK)", to: getParam("to") || "Singapore (SIN)" },
    round: { from: getParam("from") || "Jakarta (CGK)", to: getParam("to") || "Singapore (SIN)" },
    multi: { from: getParam("from") || "Jakarta (CGK)", to: getParam("to") || "Singapore (SIN)" },
  });

  // Effect to update state when URL params change (e.g. on navigation)
  useEffect(() => {
    const pTripType = getParam("tripType");
    const pFrom = getParam("from");
    const pTo = getParam("to");
    const pStart = getParam("start");
    const pEnd = getParam("end");

    if (pTripType) setTripType(pTripType);
    if (pFrom) setFrom(pFrom);
    if (pTo) setTo(pTo);
    if (pStart) setStartDate(pStart);
    if (pEnd) setEndDate(pEnd);

    if (pFrom || pTo) {
      setCommittedSearches(prev => ({
        ...prev,
        [pTripType || "oneway"]: { from: pFrom || prev[pTripType || "oneway"].from, to: pTo || prev[pTripType || "oneway"].to }
      }));
    }

  }, [searchParams]);


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
