"use client";
import { useEffect, useState } from "react";
import styles from "./MobileViewCalender.module.css";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MobileViewCalender({ onClose,
    inputType,
    onSelectDate,
    selectedDeparture,
    selectedReturn,
    faresByDate = {}, }) {
    const getToday = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    };

    const getInitialCalendarMonth = () => {
        const sourceDate = selectedDeparture || new Date();
        const parsedDate =
            sourceDate instanceof Date ? sourceDate : new Date(sourceDate);

        if (isNaN(parsedDate.getTime())) {
            return new Date();
        }

        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
    };

    const [currentDate, setCurrentDate] = useState(getInitialCalendarMonth);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [today] = useState(getToday);




    useEffect(() => {
        setStartDate(selectedDeparture || null);
        setEndDate(
            inputType === "roundtrip" ? selectedReturn || null : null
        );
    }, [selectedDeparture, selectedReturn, inputType]);

    useEffect(() => {
        setCurrentDate(getInitialCalendarMonth());
    }, [selectedDeparture]);


    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);



    const isSameDay = (d1, d2) =>
        d1 && d2 && d1.toDateString() === d2.toDateString();

    const isBeforeToday = (date) => {
        if (!date) return false;
        return date < today;
    };

    const isInRange = (item) => {
        if (
            inputType !== "roundtrip" ||
            !startDate ||
            !endDate ||
            item.muted
        ) {
            return false;
        }

        const d = buildDate(item);
        return d > startDate && d < endDate;
    };




    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const getPriceForDate = (dateKey, muted) => {
        if (muted || !dateKey) return null;

        const rawFare = faresByDate?.[dateKey];
        const parsedFare = Number(rawFare);

        return Number.isFinite(parsedFare) && parsedFare > 0 ? parsedFare : null;
    };
    const getPriceTrend = (currentPrice, prevPrice) => {
        if (!prevPrice) return "normal";
        if (currentPrice > prevPrice) return "increase";
        return "normal";
    };



    const dates = [];
    // previous month dates (muted)
    for (let i = firstDay - 1; i >= 0; i--) {
        dates.push({
            day: prevMonthDays - i,
            muted: true,
            price: null,
            monthOffset: -1,
        });
    }

    // current month dates
    let lastPrice = null;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const price = getPriceForDate(dateKey, false);
        const trend = getPriceTrend(price, lastPrice);

        dates.push({
            day: d,
            muted: false,
            price,
            trend,
            dateKey,
            monthOffset: 0, // 🔥 IMPORTANT
        });

        lastPrice = price;
    }
    const buildDate = (item) => {
        return new Date(year, month + item.monthOffset, item.day);
    };

    const isCurrentMonthBeforeToday = (item) =>
        item.monthOffset === 0 && isBeforeToday(buildDate(item));

    const canGoToPreviousMonth =
        year > today.getFullYear() ||
        (year === today.getFullYear() && month > today.getMonth());

    const totalDays =
        startDate && endDate
            ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
            : startDate
                ? 1
                : 0;

    const handleDateClick = (item) => {
        if (item.muted || isCurrentMonthBeforeToday(item)) return;

        const clickedDate = buildDate(item);

        // 🟢 ONE WAY → auto select & close
        if (inputType === "oneway") {
            setStartDate(clickedDate);
            setEndDate(null);

            onSelectDate?.({
                departure: clickedDate,
                returnDate: null,
            });

            onClose(); // 🔥 auto close
            return;
        }

        // 🔵 ROUND TRIP
        if (!startDate || endDate) {
            // first click → departure
            setStartDate(clickedDate);
            setEndDate(null);
        } else if (clickedDate >= startDate) {
            // second click → return
            setEndDate(clickedDate);

            onSelectDate?.({
                departure: startDate,
                returnDate: clickedDate,
            });

            onClose(); // 🔥 auto close after return
        }
    };

    const formatHeaderDate = () => {
        if (inputType === "oneway") {
            return startDate
                ? startDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "Select Date";
        }

        if (startDate && endDate) {
            return `${startDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            })} - ${endDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })}`;
        }

        if (startDate) {
            return startDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            });
        }

        return "Select Dates";
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.sheet}`} onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className={styles.header}>

                    <div className={styles.inputRow}>
                        <span className={styles.label}>{inputType}</span>
                        <img src="/icons/Close.svg" alt="close" onClick={onClose} />
                    </div>
                    <div className={styles.selectedDate}>{formatHeaderDate()}</div>
                </div>


                <div className={styles.calendarSection}>
                    <div className={styles.monthHeader}>
                        <button
                            className={styles.leftBtn}
                            onClick={() => {
                                if (!canGoToPreviousMonth) return;
                                setCurrentDate(new Date(year, month - 1));
                            }}
                            disabled={!canGoToPreviousMonth}
                        >
                            <img src="/icons/Chevron.svg" alt="" />
                        </button>
                        <span className={styles.monthHeaderText}>
                            {currentDate.toLocaleString("en-US", {
                                month: "long",
                                year: "numeric",
                            }).toUpperCase()}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentDate(new Date(year, month + 1))
                            }
                        >
                            <img src="/icons/Chevron.svg" alt="" />
                        </button>
                    </div>

                    {/* WEEK DAYS */}
                    <div className={styles.weekDays}>
                        {WEEK_DAYS.map((day) => (
                            <div className={styles.daysName} key={day}>{day}</div>
                        ))}
                    </div>

                    {/* DATE GRID */}
                    <div className={styles.calendarGrid}>
                        {dates.map((item, index) => (
                            <div
                                key={index}
                                className={`
        ${styles.dateCell}
        ${item.muted ? styles.muted : ""}
        ${isCurrentMonthBeforeToday(item) ? styles.disabledDate : ""}
        ${inputType === "oneway" && isSameDay(buildDate(item), startDate) ? styles.selected : ""}
        ${inputType === "roundtrip" && isSameDay(buildDate(item), startDate)
                                        ? styles.rangeStart
                                        : ""}

${inputType === "roundtrip" && isSameDay(buildDate(item), endDate)
                                        ? styles.rangeEnd
                                        : ""}

${inputType === "roundtrip" && isInRange(item)
                                        ? styles.inRange
                                        : ""}
    `}
                                onClick={() =>
                                    !item.muted &&
                                    !isCurrentMonthBeforeToday(item) &&
                                    handleDateClick(item)
                                }
                            >
                                <span className={styles.dayText}>{item.day}</span>

                                {item.price && (
                                    <span
                                        className={`
                ${styles.priceText}
                ${item.trend === "increase" ? styles.priceUp : ""}
            `}
                                    >
                                        ₹{item.price}
                                    </span>
                                )}
                            </div>

                        ))}
                    </div>

                </div>
                <div className={styles.totalDayContainer}>
                    <span className={styles.total}>Total</span>
                    <span className={styles.numberOfDay}>{totalDays > 0 ? `${totalDays} Day(s)` : ""}</span>
                </div>
            </div>
        </div>
    );
}
