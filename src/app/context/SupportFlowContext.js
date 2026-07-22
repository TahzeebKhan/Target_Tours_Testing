// app/support/context/SupportFlowContext.js
"use client";

import { createContext, useContext, useState } from "react";

const SupportFlowContext = createContext(null);

export const SupportFlowProvider = ({ children }) => {
  const [step, setStep] = useState("support");
  // "support" | "contact" | "help" | "connect"

  return (
    <SupportFlowContext.Provider value={{ step, setStep }}>
      {children}
    </SupportFlowContext.Provider>
  );
};

export const useSupportFlow = () => {
  const ctx = useContext(SupportFlowContext);
  if (!ctx) {
    throw new Error("useSupportFlow must be used inside SupportFlowProvider");
  }
  return ctx;
};
