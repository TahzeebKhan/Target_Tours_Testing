"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useFlightBooking } from "../../FlightBookingContext";
import BaggageDetails from "../baggageDetails/BaggageDetails";
import MealsDetails from "../mealsDetails/MealsDetails";
import SeatingDetails from "../seatingDetails/SeatingDetails";
import styles from "./ExtrasStep.module.css";

const extras = [
  { id: "baggage", label: "Baggage", Component: BaggageDetails },
  { id: "meals", label: "Meals", Component: MealsDetails },
  { id: "seats", label: "Seat Selection", Component: SeatingDetails },
];

export default function ExtrasStep() {
  const { setCurrentStep } = useFlightBooking();
  const [openExtra, setOpenExtra] = useState(null);

  const goToPayment = () => setCurrentStep(6);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Choose Your Extras</h1>
          <p>Add baggage, meals, or seats to your booking.</p>
        </div>
        <button type="button" className={styles.skipTop} onClick={goToPayment}>
          SKIP
        </button>
      </header>

      <section className={styles.extrasCard}>
        {extras.map(({ id, label, Component }) => {
          const isOpen = openExtra === id;
          return (
            <div className={styles.extra} key={id}>
              <button
                type="button"
                className={styles.extraHeader}
                aria-expanded={isOpen}
                onClick={() => setOpenExtra(isOpen ? null : id)}
              >
                <span>{label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                />
              </button>
              {isOpen && (
                <div className={styles.extraContent}>
                  <Component />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <footer className={styles.actions}>
        <button type="button" className={styles.backButton} onClick={() => setCurrentStep(2)}>
          BACK
        </button>
        <div className={styles.forwardActions}>
          <button type="button" className={styles.skipButton} onClick={goToPayment}>
            SKIP
          </button>
          <button type="button" className={styles.continueButton} onClick={goToPayment}>
            CONTINUE
          </button>
        </div>
      </footer>
    </main>
  );
}
