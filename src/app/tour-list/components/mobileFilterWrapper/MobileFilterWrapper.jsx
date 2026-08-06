"use client";
import styles from "./MobileFilterWrapper.module.css";
import { X } from "lucide-react";
import FlightFilters from "../flightFilter/FlightsFilters";
import { useState } from "react";

export default function MobileFilterWrapper({ open, setOpen }) {

    const [resetKey, setResetKey] = useState(0);

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
                            <FlightFilters
                                key={resetKey}
                                onClose={() => setOpen(false)}
                            />
                        </div>

                        {/* Footer */}
                        <div className={styles.footer}>
                            <button className={styles.reset} onClick={() => setResetKey((k) => k + 1)}>RESET</button>
                            <button className={styles.apply} onClick={() => setOpen(false)}>APPLY</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
