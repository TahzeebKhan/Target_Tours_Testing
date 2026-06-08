"use client";

import React, { useState } from "react";
import styles from "./StepBar.module.css";

const steps = [
  { label: "Overview", target: "overview" },
  { label: "Day itinerary", target: "day-itinerary" },
  { label: "Inclusion exclusion", target: "inclusions" },
  { label: "Tour policy", target: "tour-policy" },
  { label: "Stays", target: "stays" },
  { label: "Upcoming departures", target: "upcoming-departures" },
  { label: "Testimonials", target: "testimonials" },
];

const StepBar = () => {
  const [activeStep, setActiveStep] = useState("overview");

  const handleStepClick = (target) => {
    setActiveStep(target);

    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav className={styles.stepBar} aria-label="Tour details sections">
      <div className={styles.stepBarInner}>
        {steps.map((step) => (
          <button
            className={`${styles.step} ${
              activeStep === step.target ? styles.activeStep : ""
            }`}
            key={step.target}
            type="button"
            onClick={() => handleStepClick(step.target)}
          >
            {step.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default StepBar;
