"use client";

import { createContext, useContext, useState } from "react";

const TripTypeContext = createContext(null);

/**
 * Provider
 */
export function TripTypeProvider({ children }) {
  const [tripType, setTripType] = useState("oneway");

  return (
    <TripTypeContext.Provider value={{ tripType, setTripType }}>
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
