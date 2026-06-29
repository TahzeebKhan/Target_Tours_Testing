"use client";

import { useMemo, useState } from "react";
import styles from "./customDeparture.module.css";

const MONTHS = [
  { name: "August", month: 7, price: 98945 },
  { name: "September", month: 8, price: 98945 },
  { name: "October", month: 9, price: 74200 },
  { name: "November", month: 10, price: 112600 },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

const formatTripDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstDay + 1;

    if (dayOffset < 1) {
      return {
        date: new Date(year, month - 1, previousMonthDays + dayOffset),
        muted: true,
      };
    }

    if (dayOffset > daysInMonth) {
      return {
        date: new Date(year, month + 1, dayOffset - daysInMonth),
        muted: true,
      };
    }

    return { date: new Date(year, month, dayOffset), muted: false };
  });
};

const CustomDeparture = ({ data, onBook }) => {
  const year = 2026;
  const duration = Math.max(Number(data?.nights || data?.duration_nights || 7), 1);
  const packagePrice = Number(data?.started_price || data?.base_price || 0);
  const [openMonth, setOpenMonth] = useState("September");
  const [selectedDate, setSelectedDate] = useState(new Date(year, 8, 15));

  const activeMonth = MONTHS.find((month) => month.name === openMonth) || MONTHS[1];
  const dailyPrice = packagePrice || activeMonth.price;
  const calendarDays = useMemo(
    () => getCalendarDays(year, activeMonth.month),
    [activeMonth.month],
  );
  const returnDate = new Date(selectedDate);
  returnDate.setDate(returnDate.getDate() + duration);
  const total = dailyPrice * duration;

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
                    {month.name}
                  </button>
                );
              })}
            </div>

            <div className={styles.calendarPanel}>
              <div className={styles.calendarHeader}>
                <button type="button" aria-label="Previous month">‹</button>
                <p>{activeMonth.name}<small>{year}</small></p>
                <button type="button" aria-label="Next month">›</button>
              </div>

              <div className={styles.weekdays}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className={styles.calendarGrid}>
                {calendarDays.map(({ date, muted }) => {
                  const time = date.getTime();
                  const selectedTime = selectedDate.getTime();
                  const inRange = time >= selectedTime && time <= returnDate.getTime();

                  return (
                    <button
                      type="button"
                      key={date.toISOString()}
                      className={`${styles.day} ${muted ? styles.muted : ""} ${
                        inRange ? styles.selected : ""
                      }`}
                      onClick={() => {
                        if (!muted) setSelectedDate(date);
                      }}
                    >
                      <span>{date.getDate()}</span>
                      <small>₹{formatPrice(dailyPrice)}</small>
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

            <button
              type="button"
              className={styles.bookButton}
              onClick={() => onBook?.({ departureDate: selectedDate, returnDate, price: total })}
            >
              SPEAK TO AN AGENT
            </button>
            <button type="button" className={styles.detailsButton}>Submit Inquiry</button>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default CustomDeparture;
