"use client";

import { useMemo, useState } from "react";
import styles from "./customDeparture.module.css";

const MONTHS = [
  { name: "February", month: 1, price: 43500 },
  { name: "March", month: 2, price: 44200 },
  { name: "April", month: 3, price: 46200 },
  { name: "May", month: 4, price: 48000 },
  { name: "June", month: 5, price: 52500 },
  { name: "July", month: 6, price: 55500 },
  { name: "August", month: 7, price: 57800 },
  { name: "September", month: 8, price: 60945 },
  { name: "October", month: 9, price: 74200 },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

const formatTripDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getDayPrice = (date, basePrice) => {
  const day = date.getDate();
  const month = date.getMonth(); // 8 = Sept
  
  if (month === 8) {
    // September prices from screenshot
    const septPrices = {
      1: 45500, 2: 46200, 3: 48000, 4: 52500, 5: 55500, 6: 57800,
      7: 43500, 8: 44200, 9: 45000, 10: 46500, 11: 48000, 12: 59000, 13: 60945,
      14: 62000, 15: 63500, 16: 65000, 17: 67200, 18: 68500, 19: 71000,
      20: 74500, 21: 76000, 22: 77500, 23: 78000, 24: 79200, 25: 72000, 26: 68000,
      27: 65500, 28: 63000, 29: 61500, 30: 59000
    };
    return septPrices[day] || basePrice || 48000;
  }
  
  // For other months, vary around basePrice
  const variation = ((day * 7) % 15) - 7; // -7% to +7%
  const price = (basePrice || 48000) * (1 + variation / 100);
  return Math.round(price / 100) * 100;
};

const getCalendarDays = (year, month) => {
  let firstDay = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = (firstDay + daysInMonth) <= 35 ? 35 : 42;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstDay + 1;
    const date = new Date(year, month, dayOffset);
    const isMuted = date.getMonth() !== month;

    return { date, muted: isMuted };
  });
};

const CustomDeparture = ({ data, onBook }) => {
  const year = 2026;
  const duration = Math.max(Number(data?.nights || data?.duration_nights || 7), 1);
  const packagePrice = Number(data?.started_price || data?.base_price || 0);
  const [openMonth, setOpenMonth] = useState("September");
  const [selectedDate, setSelectedDate] = useState(new Date(year, 8, 13)); // Default to Sept 13

  const activeMonth = MONTHS.find((month) => month.name === openMonth) || MONTHS[7];
  
  const calendarDays = useMemo(
    () => getCalendarDays(year, activeMonth.month),
    [activeMonth.month],
  );
  
  const returnDate = new Date(selectedDate);
  returnDate.setDate(returnDate.getDate() + duration);
  
  const selectedPrice = useMemo(() => getDayPrice(selectedDate, packagePrice), [selectedDate, packagePrice]);
  const total = selectedPrice;

  const handlePrevMonth = () => {
    const currentIndex = MONTHS.findIndex((m) => m.name === openMonth);
    if (currentIndex > 0) {
      setOpenMonth(MONTHS[currentIndex - 1].name);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = MONTHS.findIndex((m) => m.name === openMonth);
    if (currentIndex < MONTHS.length - 1) {
      setOpenMonth(MONTHS[currentIndex + 1].name);
    }
  };

  return (
    <section id="custom-departures" className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.title}>Choose Your Journey</h2>
        <p className={styles.subtitle}>
          Pick your perfect departure date—then let us take care of the rest.
        </p>

        <div className={styles.departureBody}>
          {/* Calendar Card (Left) */}
          <div className={styles.calendarCard}>
            {/* Month Tabs Selector inside Calendar Card */}
            <div className={styles.tabsContainer}>
              {MONTHS.map((month) => {
                const isActive = openMonth === month.name;
                return (
                  <button
                    key={month.name}
                    type="button"
                    className={`${styles.tabButton} ${isActive ? styles.activeTab : ""}`}
                    onClick={() => setOpenMonth(month.name)}
                  >
                    {month.name.slice(0, 3).toUpperCase()} {year}
                  </button>
                );
              })}
            </div>

            <div className={styles.calendarPanel}>
              <div className={styles.calendarHeader}>
                <p>{activeMonth.name}<small>{year}</small></p>
                <div className={styles.navButtons}>
                  <button type="button" aria-label="Previous month" onClick={handlePrevMonth}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>
                  <button type="button" aria-label="Next month" onClick={handleNextMonth}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.weekdays}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className={styles.calendarGrid}>
                {calendarDays.map(({ date, muted }) => {
                  const time = date.getTime();
                  const selectedTime = selectedDate.getTime();
                  const isSelected = time === selectedTime;
                  const price = getDayPrice(date, packagePrice);

                  return (
                    <button
                      type="button"
                      key={date.toISOString()}
                      className={`${styles.day} ${muted ? styles.muted : ""} ${
                        isSelected ? styles.selected : ""
                      }`}
                      onClick={() => {
                        if (!muted) setSelectedDate(date);
                      }}
                    >
                      <span>{date.getDate()}</span>
                      <small>₹{formatPrice(price)}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trip Details Card (Right) */}
          <aside className={styles.tripCard}>
            <div className={styles.tripDateRow}>
              <p className={styles.tripDateText}>
                {formatTripDate(selectedDate)} → {formatTripDate(returnDate)}
              </p>
              <span className={styles.nightsBadge}>{duration} Days / {duration - 1} Nights</span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>From</span>
              <span className={styles.priceValue}>
                ₹{formatPrice(total)} <small>per person</small>
              </span>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusBadge}>Available</span>
              <span className={styles.statusText}>Limited spots remaining</span>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.bookButton}
                onClick={() => onBook?.({ departureDate: selectedDate, returnDate, price: total })}
              >
                SPEAK TO AN AGENT
              </button>
              <button type="button" className={styles.detailsButton}>Submit Inquiry</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default CustomDeparture;
