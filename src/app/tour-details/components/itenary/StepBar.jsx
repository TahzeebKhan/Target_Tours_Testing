"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const stepRefs = useRef({});

  const handleStepClick = (target) => {
    setActiveStep(target);

    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    let frameId = 0;

    const updateActiveStep = () => {
      const activationLine = 150;
      const availableSteps = steps
        .map((step) => ({
          ...step,
          element: document.getElementById(step.target),
        }))
        .filter((step) => step.element);

      const active =
        availableSteps
          .map((step) => {
            const rect = step.element.getBoundingClientRect();
            return {
              ...step,
              distance: Math.abs(rect.top - activationLine),
              isPastActivationLine: rect.top <= activationLine,
            };
          })
          .filter((step) => step.isPastActivationLine)
          .sort((a, b) => a.distance - b.distance)[0]?.target ||
        availableSteps[0]?.target ||
        steps[0].target;

      setActiveStep(active);
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveStep);
    };

    updateActiveStep();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    stepRefs.current[activeStep]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeStep]);

  return (
    <nav className={styles.stepBar} aria-label="Tour details sections">
      <div className={styles.stepBarInner}>
        {steps.map((step) => (
          <button
            className={`${styles.step} ${
              activeStep === step.target ? styles.activeStep : ""
            }`}
            key={step.target}
            ref={(element) => {
              stepRefs.current[step.target] = element;
            }}
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
