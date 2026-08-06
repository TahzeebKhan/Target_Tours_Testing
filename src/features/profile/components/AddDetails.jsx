"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./AddDetails.module.css";

import DateCalendarModal from "@/shared/components/calendar/DateCalendarModal";
import CalendarMonths from "@/shared/components/calendar/CalendarMonths";

const AddDetails = ({ onClose }) => {
  const calendarRef = useRef(null);

  const [formData, setFormData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "1 Adult  1 Room",
  });

  const [isActive, setIsActive] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCalendarField, setActiveCalendarField] = useState(null); // "start" | "end"
  const [isClosing, setIsClosing] = useState(false);

  /* ------------------ DATE CLICK LOGIC ------------------ */
  const handleDateClick = (date) => {
    if (activeCalendarField === "start") {
      setFormData((prev) => ({
        ...prev,
        checkIn: date,
        checkOut:
          prev.checkOut && new Date(date) > new Date(prev.checkOut)
            ? ""
            : prev.checkOut,
      }));
      setShowCalendar(false);
    } else if (
      activeCalendarField === "end" &&
      formData.checkIn &&
      new Date(date) >= new Date(formData.checkIn)
    ) {
      setFormData((prev) => ({
        ...prev,
        checkOut: date,
      }));
      setShowCalendar(false);
    }
  };

  /* ------------------ INPUT HANDLERS ------------------ */
  const handleCheckInClick = (e) => {
    e.stopPropagation();
    setActiveCalendarField("start");
    setShowCalendar(true);
  };

  const handleCheckOutClick = (e) => {
    e.stopPropagation();
    setActiveCalendarField("end");
    setShowCalendar(true);
  };

  /* ------------------ OUTSIDE CLICK ------------------ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContinue = () => {
    setIsActive(true);
    console.log("Form Data:", formData);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  return (
    <div className={styles.overlay}>
      <section className={`${styles.modalContainer} ${isClosing ? styles.slideOut : ''}`}>
        {/* HEADER */}
        <header className={styles.modalHeader}>
          <span className={styles.headerTitle}>ENTER DETAILS</span>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>

        </header>

        {/* FORM */}
        <form className={styles.formBody}>
          {/* WHERE TO */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>WHERE TO</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Departure"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
            />
          </div>

          {/* CHECK IN */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>CHECK IN</label>

            <div className={styles.dateField} onClick={handleCheckInClick}>
              <input
                type="text"
                className={styles.input}
                placeholder="Add dates"
                value={formData.checkIn}
                readOnly
              />
              <Image
                src="/icons/multi-city-calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
            </div>
          </div>

          {/* CHECK OUT */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>CHECK OUT</label>

            <div className={styles.dateField} onClick={handleCheckOutClick}>
              <input
                type="text"
                className={styles.input}
                placeholder="Add dates"
                value={formData.checkOut}
                readOnly
              />
              <Image
                src="/icons/multi-city-calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
            </div>
          </div>

          {/* GUESTS */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>GUESTS & ROOMS</label>
            <input
              type="text"
              className={styles.input}
              value={formData.guests}
              readOnly
            />
          </div>
        </form>

        {/* FOOTER */}
        <footer className={styles.modalFooter}>
          <button className={styles.backButton}>BACK</button>
          <button
            className={`${styles.continueButton} ${isActive ? styles.active : ""
              }`}
            onClick={handleContinue}
          >
            CONTINUE
          </button>
        </footer>
      </section>

      {/* ----------- CALENDAR MODAL ----------- */}
      {showCalendar && (
        <DateCalendarModal
          mode="roundtrip"
          onModeChange={() => { }}
          onClose={() => setShowCalendar(false)}
        >
          <div ref={calendarRef}>
            <CalendarMonths
              startDate={formData.checkIn}
              endDate={formData.checkOut}
              onDateClick={handleDateClick}
            />
          </div>
        </DateCalendarModal>
      )}
    </div>
  );
};

export default AddDetails;
