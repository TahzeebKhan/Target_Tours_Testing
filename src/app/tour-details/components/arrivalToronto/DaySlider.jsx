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
    const firstDay = Number(days[0]) || 1;
    const lastDay = Number(days[totalDays - 1]) || totalDays;
    const isFirstDay = !totalDays || safeActiveDay <= firstDay;
    const isLastDay = !totalDays || safeActiveDay >= lastDay;

    const handlePrev = () => {
        if (isFirstDay) return;
        onDaySelect?.(Math.max(firstDay, safeActiveDay - 1));
    };

    const handleNext = () => {
        if (isLastDay) return;
        onDaySelect?.(Math.min(lastDay, safeActiveDay + 1));
    };

    return (
        <div className={styles.wrapper}>
            {/* LEFT BUTTON */}
            <div
                className={`${styles.btn} ${isFirstDay ? styles.disabledBtn : ""}`}
                onClick={handlePrev}
                aria-disabled={isFirstDay}
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
                className={`${styles.btn} ${isLastDay ? styles.disabledBtn : ""}`}
                onClick={handleNext}
                aria-disabled={isLastDay}
            >
                <img src="/icons/right.svg" alt="Next" />
            </div>
        </div>
    );
}
