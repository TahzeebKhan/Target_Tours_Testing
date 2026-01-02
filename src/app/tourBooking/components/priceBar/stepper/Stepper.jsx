"use client";
import React from "react";
import styles from "./Stepper.module.css";
import { Check } from "lucide-react";
// import { useFlightBooking } from "../FlightBookingContext";
// import { useSearchParams } from "next/navigation";

const steps = [
    { id: 1, label: "Preferences" },
    { id: 2, label: "Customization" },
    { id: 3, label: "Contact" },
];

export default function Stepper({ currentStep = 1 }) {
  // Calculate progress line percentage based on currentStep
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
                            className={`${styles.stepItem} ${isActive ? styles.stepActive : ""} ${isCompleted ? styles.stepCompleted : ""}`}
                        >
                            <div className={styles.circleWrapper}>
                                <div className={isActive || isCompleted ? styles.outerRingYellow : styles.outerGrayRing} />

                                <div className={styles.stepCircle}>
                                    {isCompleted ? (
                                        <span>
                                            <Check size={16} color="white" />
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
