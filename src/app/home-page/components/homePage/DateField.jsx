"use client"
import React, { useRef, useState, useEffect } from 'react'
import styles from './DateField.module.css'
import DateCalendarModal from '@/app/components/calendar/DateCalendarModal'
import CalendarMonths from '@/app/components/calendar/CalendarMonths'
import { CalendarSVG } from '@/app/flights/components/SVGFile'


const DateField = ({
    label = "DATE",
    placeholder = "ADD DATES",
    value,
    onChange,
    min,
    max,
    name,
}) => {
    const dateRef = useRef(null);
    const [showCalendar, setShowCalendar] = useState(false)

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
        <div className={styles.field}>
            <span className={styles.label}>{label}</span>

            <div
                className={styles.dateInputWrapper}
                onClick={() => setShowCalendar(true)}
            >
                {/* Display date as readonly text */}
                <input
                    type="text"
                    readOnly
                    className={styles.contant}
                    data-placeholder={placeholder}
                    value={formatDate(value) || ''}
                    name={name}
                    required
                />

                {/* Calendar icon */}
                <button type="button" className={styles.calendarIcon} onClick={(e) => { e.stopPropagation(); setShowCalendar(true) }}>
                  <CalendarSVG />
                </button>

                {showCalendar && (
                  <DateCalendarModal
                    mode="oneway"
                    onModeChange={() => {}}
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




