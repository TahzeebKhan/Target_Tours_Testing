"use client";
import styles from "./MobileFilterWrapper.module.css";
import { X } from "lucide-react";
import FlightFilters from "../flightFilter/FlightsFilters";

export default function MobileFilterWrapper({ open, setOpen }) {


  return (
    <>
      {/* Overlay */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
           

            {/* Content */}
            <div className={styles.content}>
              <FlightFilters  onClose={() => setOpen(false)}/>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button className={styles.reset}>RESET</button>
              <button className={styles.apply}>APPLY</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
