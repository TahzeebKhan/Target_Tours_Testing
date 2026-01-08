"use client"
import React, { useRef, useState, useEffect } from 'react'
import styles from './DateField.module.css'
// import DateCalendarModal from '@/app/components/calendar/DateCalendarModal'
// import CalendarMonths from '@/app/components/calendar/CalendarMonths'
import { CalendarSVG } from '@/app/flights/components/SVGFile'
import DateCalendarModal from './calendar/DateCalendarModal';
import CalendarMonths from './calendar/CalendarMonths';


const DateField = ({
    label = "DATE",
    placeholder = "ADD DATES",
    value,
    onChange,
    min,
    max,
    name,
    className
}) => {
    const dateRef = useRef(null);
    const [showCalendar, setShowCalendar] = useState(false)
    const wrapperRef = useRef(null)

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowCalendar(false)
            }
        }

        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showCalendar])


    useEffect(() => {
        // When value prop changes externally, nothing to do here; displayed value updates automatically
    }, [value])

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date)) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    const handleDateClick = (date) => {
        // For the simple reusable field, assume single-date selection
        onChange?.({ target: { value: date } });
        setShowCalendar(false)
    }

    return (
        <div
            ref={wrapperRef}
            className={`${styles.field} ${showCalendar ? styles.active : ""}`}
        >
            <span className={styles.label}>{label}</span>

            <div
                className={styles.dateInputWrapper}
                onClick={() => {
                    if (!isMobile) {
                        setShowCalendar(true);
                    }
                }}
            >
                {/* Display date as readonly text */}
                <input
                    type="text"
                    readOnly
                    className={styles.contant}
                    placeholder={placeholder}
                    value={formatDate(value) || ''}
                    name={name}
                    required
                />

                {/* Calendar icon */}
                <button type="button" className={styles.calendarIcon} onClick={(e) => { e.stopPropagation(); setShowCalendar(true) }}>
                    <CalendarSVG className={styles.calendarIcon} />
                </button>

                {showCalendar && (
                    <DateCalendarModal
                        mode="oneway"
                        onModeChange={() => { }}
                        onClose={() => setShowCalendar(false)}
                    >
                        <div>
                            <CalendarMonths startDate={value} endDate={null} onDateClick={handleDateClick} />
                        </div>
                    </DateCalendarModal>
                )}
            </div>
        </div>
    );
};

export default DateField;




