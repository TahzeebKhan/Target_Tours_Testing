"use client";
import React, { useEffect, useRef } from "react";
import styles from "./PassengerClassSelector.module.css";
import { Minus, Plus } from "lucide-react";
import { useTripType } from "../TripTypeContext";

const CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];

const PassengerClassSelector = ({
  open,
  setOpen,
  passengers,
  setPassengers,
  travelClass,
  setTravelClass,
}) => {
  const { tripType } = useTripType();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [setOpen]);

  const updateCount = (key, delta) => {
    setPassengers((prev) => {
      const next = { ...prev };
      next[key] = Math.max(0, prev[key] + delta);

      // infants <= adults
      if (key === "adult" && next.infant > next.adult) {
        next.infant = next.adult;
      }

      return next;
    });
  };

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`${styles.dropdown}
      ${tripType === 'oneway' ? styles.oneWayDropdown : ""}
      ${tripType === 'round' ? styles.roundTripDropDown : ""}
      `}
      ref={ref}
    >
      <h4 className={styles.heading}>Set Passenger</h4>
      <div className={styles.counterDiv}>
        {[
          { key: "adult", label: "Adult (above 12 years old)" },
          { key: "child", label: "Children (2 – 11 years old)" },
          { key: "infant", label: "Infant (below 2 years old)" },
        ].map((row) => (
          <div key={row.key} className={styles.row}>
            <div>
              <div className={styles.label}>{row.label}</div>
              {/* <div className={styles.sub}>{row.sub}</div> */}
            </div>

            <div className={styles.counter}>
              <button
                onClick={() => updateCount(row.key, -1)}
                className={styles.minusBtn}
                disabled={passengers[row.key] === 0}
              >
                <Minus size={13} />
              </button>
              <span>{passengers[row.key]}</span>
              <button
                className={styles.plusBtn}
                onClick={() => updateCount(row.key, 1)}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <h4 className={styles.heading}>Preferred Class</h4>

      <div className={styles.classGrid}>
        {CLASSES.map((cls) => (
          <button
            key={cls}
            className={`${styles.classBtn} ${travelClass === cls ? styles.active : ""
              }`}
            onClick={() => setTravelClass(cls)}
          >
            {cls}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PassengerClassSelector;
