"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import styles from "./HolidayGuestSelector.module.css";

const PASSENGER_ROWS = [
  { key: "adult", label: "Adult (above 12 years old)", min: 1 },
  { key: "child", label: "Children (2 - 11 years old)", min: 0 },
  { key: "infant", label: "Infant (below 2 years old)", min: 0 },
];

const HolidayGuestSelector = ({ open, setOpen, passengers, setPassengers }) => {
  const updateCount = (key, delta, min) => {
    setPassengers((current) => {
      const nextValue = Math.max(min, Number(current[key] || 0) + delta);
      const nextPassengers = {
        ...current,
        [key]: nextValue,
      };

      if (key === "adult" && nextPassengers.infant > nextValue) {
        nextPassengers.infant = nextValue;
      }

      if (key === "infant" && nextValue > nextPassengers.adult) {
        nextPassengers.infant = nextPassengers.adult;
      }

      return nextPassengers;
    });
  };

  if (!open) return null;

  return (
    <div className={styles.dropdown} onClick={(event) => event.stopPropagation()}>
      <h4 className={styles.heading}>Select Guest</h4>

      <div className={styles.counterGroup}>
        {PASSENGER_ROWS.map((row) => (
          <div className={styles.row} key={row.key}>
            <div className={styles.label}>{row.label}</div>
            <div className={styles.counter}>
              <button
                type="button"
                className={styles.counterButton}
                disabled={passengers[row.key] <= row.min}
                onClick={() => updateCount(row.key, -1, row.min)}
              >
                <Minus size={13} />
              </button>
              <span>{passengers[row.key]}</span>
              <button
                type="button"
                className={styles.counterButton}
                onClick={() => updateCount(row.key, 1, row.min)}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.applyButtonWrapper}>
        <button
          type="button"
          className={styles.applyButton}
          onClick={() => setOpen(false)}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default HolidayGuestSelector;
