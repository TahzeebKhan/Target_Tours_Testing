"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./DaySlider.module.css";

export default function DaySlider({
    days = [],
    activeDay = 1,
    onDaySelect,
}) {
    const listRef = useRef(null);

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

    const totalDays = days.length;
    const safeActiveDay = activeDay > 0 ? activeDay : 1;

    const handlePrev = () => {
        if (!totalDays) return;
        onDaySelect?.(Math.max(1, safeActiveDay - 1));
    };

    const handleNext = () => {
        if (!totalDays) return;
        onDaySelect?.(Math.min(totalDays, safeActiveDay + 1));
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
                {days.map((dayValue) => {
                    const day = Number(dayValue) || 1;
                    return (
                        <li
                            key={day}
                            data-day={day}
                            className={`${styles.dayItem} ${safeActiveDay === day ? styles.active : ""
                                }`}
                            onClick={() => onDaySelect?.(day)}
                        >
                            <span className={`${styles.dayLabel} ${safeActiveDay === day ? styles.active : ""}`}>DAY</span>
                            <span className={`${styles.dayNumber} ${safeActiveDay === day ? styles.active : ""}`}>
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
