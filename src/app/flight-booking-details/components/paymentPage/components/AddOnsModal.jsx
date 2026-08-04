"use client";

import { useEffect, useState } from "react";
import BaggageDetails from "../../baggageDetails/BaggageDetails";
import MealsDetails from "../../mealsDetails/MealsDetails";
import SeatingDetails from "../../seatingDetails/SeatingDetails";
import styles from "./AddOnsModal.module.css";

const ADD_ONS = [
  { id: "baggage", label: "Baggage", Component: BaggageDetails },
  { id: "meals", label: "Meals", Component: MealsDetails },
  { id: "seats", label: "Seat Selection", Component: SeatingDetails },
];

const AddOnsModal = ({ isOpen, onClose }) => {
  const [openAccordion, setOpenAccordion] = useState("baggage");

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ons-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id="add-ons-title">Add Ons</h2>
            <p>Add or update baggage, meals, and seats.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.accordions}>
          {ADD_ONS.map(({ id, label, Component }) => {
            const isExpanded = openAccordion === id;
            return (
              <section className={styles.accordion} key={id}>
                <button
                  type="button"
                  className={styles.accordionTrigger}
                  aria-expanded={isExpanded}
                  onClick={() => setOpenAccordion(isExpanded ? null : id)}
                >
                  <span>{label}</span>
                  <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ""}`}>
                    <img src='icons/DownArrows.svg'/>
                  </span>
                </button>
                {isExpanded && (
                  <div className={styles.accordionContent}>
                    <Component />
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>DONE</button>
        </div>
      </div>
    </div>
  );
};

export default AddOnsModal;
