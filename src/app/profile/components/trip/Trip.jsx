"use client";

import { useState } from "react";
import EmptyTrip from "../emptyTrip/EmptyTrip";
import Reservations from "../reservations/Reservations";
import IndividualProperty from "../individualProperty/IndividualProperty";

const Trip = () => {
  const [step, setStep] = useState("RESERVATIONS");

  const [activeTab, setActiveTab] = useState("HOTEL BOOKING");
  // EMPTY | RESERVATIONS | DETAILS

  if (step === "EMPTY") {
    return <EmptyTrip onStartSearching={() => setStep("RESERVATIONS")} />;
  }

  if (step === "RESERVATIONS") {
    return (
      <Reservations
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCheckDetails={() => setStep("DETAILS")}
      />
    );
  }

  return (
    <IndividualProperty
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onBack={() => setStep("RESERVATIONS")}
    />
  );
};

export default Trip;
