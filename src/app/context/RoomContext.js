// app/context/RoomContext.jsx
"use client";
import { createContext, useContext } from "react";

const RoomContext = createContext(null);

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
};

export const RoomProvider = ({ value, children }) => {
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
