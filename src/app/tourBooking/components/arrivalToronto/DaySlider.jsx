"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./DaySlider.module.css";

const TOTAL_DAYS = 30;

export default function DaySlider() {
    const [activeDay, setActiveDay] = useState(1);
    const listRef = useRef(null);

    // scroll active item into center
    useEffect(() => {
        const activeEl = listRef.current?.querySelector(
            `[data-day="${activeDay}"]`
        );
        activeEl?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }, [activeDay]);

    const handlePrev = () => {
        setActiveDay((d) => Math.max(1, d - 1));
    };

    const handleNext = () => {
        setActiveDay((d) => Math.min(TOTAL_DAYS, d + 1));
    };

    return (
        <div className={styles.wrapper}>
            {/* LEFT BUTTON */}
            <div
                className={styles.btn}
                onClick={handlePrev}
            >
                <img src="/icons/left.svg" alt="Previous" />
            </div>

            {/* DAYS */}
            <ul className={styles.dayList} ref={listRef}>
                {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                    const day = i + 1;
                    return (
                        <li
                            key={day}
                            data-day={day}
                            className={`${styles.dayItem} ${activeDay === day ? styles.active : ""
                                }`}
                            onClick={() => setActiveDay(day)}
                        >
                            <span className={`${styles.dayLabel} ${activeDay === day ? styles.active : ""}`}>DAY</span>
                            <span className={`${styles.dayNumber} ${activeDay === day ? styles.active : ""}`}>
                                {String(day).padStart(2, "0")}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {/* RIGHT BUTTON */}
            <div
                className={styles.btn}
                onClick={handleNext}
            >
                <img src="/icons/right.svg" alt="Next" />
            </div>
        </div>
    );
}
