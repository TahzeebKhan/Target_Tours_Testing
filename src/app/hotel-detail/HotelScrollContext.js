"use client";
import { createContext, useContext } from "react";

export const HotelScrollContext = createContext(null);

export const useHotelScroll = () => {
  const context = useContext(HotelScrollContext);
  if (!context) {
    throw new Error("useHotelScroll must be used inside Provider");
  }
  return context;
};
