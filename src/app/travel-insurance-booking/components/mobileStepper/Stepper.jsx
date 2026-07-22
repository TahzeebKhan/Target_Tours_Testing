"use client";

import styles from "./Stepper.module.css";

const Stepper = ({ currentStep }) => {
    const steps = [
        "TRIP INFO",
        "CHOOSE PLAN",
        "PERSONAL DETAILS",
        "REVIEW & PAY",
    ];

    return (
        <nav className={styles.stepper}>
            {steps.map((label, index) => {
                const isActive = index <= currentStep - 1;

                return (
                    <div key={label} className={styles.stepWrapper}>
                        <span className={styles.stepLabel}>{label}</span>
                        <div
                            className={`${styles.stepDivider} ${isActive ? styles.stepDividerActive : ""
                                }`}
                        />
                    </div>
                );
            })}
        </nav>
    );
};

export default Stepper;
