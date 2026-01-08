"use client";

import { useState } from "react";
import EmptyTrip from "../emptyTrip/EmptyTrip";
import Reservations from "../reservations/Reservations";
import IndividualProperty from "../individualProperty/IndividualProperty";

const Trip = () => {
  const [step, setStep] = useState("EMPTY");
  // EMPTY | RESERVATIONS | DETAILS

  if (step === "EMPTY") {
    return (
      <EmptyTrip onStartSearching={() => setStep("RESERVATIONS")} />
    );
  }

  if (step === "RESERVATIONS") {
    return (
      <Reservations onCheckDetails={() => setStep("DETAILS")} />
    );
  }

  return (
    <IndividualProperty onBack={() => setStep("RESERVATIONS")} />
  );
};

export default Trip;
