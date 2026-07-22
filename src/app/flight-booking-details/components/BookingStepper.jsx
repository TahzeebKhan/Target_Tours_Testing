"use client";
import React from "react";
import styles from "./BookingStepper.module.css";
import { Check } from "lucide-react";
import { useFlightBooking } from "../FlightBookingContext";
import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";

const steps = [
  { id: 1, label: "Search" },
  { id: 2, label: "Passenger Details" },
  { id: 3, label: "Baggage" },
  { id: 4, label: "Meal" },
  { id: 5, label: "Seating" },
  { id: 6, label: "Overview & Payment" },
];

export default function BookingStepper() {
  const router = useRouter();
  const { currentStep, setCurrentStep } = useFlightBooking();

  const handleStepClick = (stepId) => {
    if (stepId > currentStep) return;

    if (stepId === 1) {
      router.push("/flights");
      return;
    }

    setCurrentStep(stepId);
  };

  return (
    <div className={styles.stepperWrapper}>
      <div className={styles.stepperContainer}>
        {/* Steps */}
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div
              key={step.id}
              role={step.id <= currentStep ? "button" : undefined}
              tabIndex={step.id <= currentStep ? 0 : undefined}
              onClick={() => handleStepClick(step.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleStepClick(step.id);
                }
              }}
              className={`${styles.stepItem} ${
                isActive ? styles.stepActive : ""
              } ${isCompleted ? styles.stepCompleted : ""}
                                ${
                                  step.id <= currentStep
                                    ? styles.stepClickable
                                    : ""
                                }
                                ${step.id === 6 ? styles.lastStepItem : ""}
                                `}
            >
              <div className={styles.circleWrapper}>
                <div
                  className={` ${
                    isActive || isCompleted
                      ? styles.outerRingYellow
                      : styles.outerGrayRing
                  }`}
                ></div>

                <div className={styles.stepCircle}>
                  {isCompleted ? (
                    <span>
                      <Check size={16} color="white" />{" "}
                    </span>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
