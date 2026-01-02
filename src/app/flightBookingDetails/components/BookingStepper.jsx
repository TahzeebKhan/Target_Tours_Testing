"use client";
"use client";
import React from "react";
import styles from "./BookingStepper.module.css";
import { Check } from "lucide-react";
import { useFlightBooking } from "../FlightBookingContext";
import { useSearchParams } from "next/navigation";

const steps = [
    { id: 1, label: "Search" },
    { id: 2, label: "Passenger Details" },
    { id: 3, label: "Baggage" },
    { id: 4, label: "Meal" },
    { id: 5, label: "Seating" },
    { id: 6, label: "Overview & Payment" }, 
];

export default function BookingStepper() {
  const { currentStep } = useFlightBooking();
  // Calculate progress line percentage based on currentStep
  // If currentStep is 3, line goes from 1 to 3.
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className={styles.stepperWrapper}>
            <div className={styles.stepperContainer}>
                {/* Steps */}
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div
                            key={step.id}
                            className={`${styles.stepItem} ${isActive ? styles.stepActive : ""
                                } ${isCompleted ? styles.stepCompleted : ""}`}
                        >
                            <div className={styles.circleWrapper}>
                                <div
                                    className={` ${isActive || isCompleted
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
