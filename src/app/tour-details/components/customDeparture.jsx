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
        <h2 className={styles.title}>Upcoming Departures</h2>
        <p className={styles.subtitle}>
          Select your preferred departure date across three months. Availability
          is updated in real-time.
        </p>

        <div className={styles.months}>
          {MONTHS.map((month) => {
            const isOpen = openMonth === month.name;

            return (
              <article className={styles.monthCard} key={month.name}>
                <button
                  type="button"
                  className={styles.monthHeader}
                  aria-expanded={isOpen}
                  onClick={() => setOpenMonth(isOpen ? "" : month.name)}
                >
                  <span>
                    <strong>{month.name}</strong>
                    <small>Starting From ₹{formatPrice(packagePrice || month.price)}</small>
                  </span>
                  <span className={styles.chevron}>{isOpen ? "⌃" : "⌄"}</span>
                </button>

                {isOpen && (
                  <div className={styles.departureBody}>
                    <div className={styles.calendarPanel}>
                      <div className={styles.calendarHeader}>
                        <button type="button" aria-label="Previous month">‹</button>
                        <p>{month.name}<small>{year}</small></p>
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

                    <aside className={styles.tripCard}>
                      <p className={styles.tripLabel}>Your Trip</p>
                      <p className={styles.tripDate}>🛫 {formatTripDate(selectedDate)}</p>
                      <span className={styles.nights}>{duration} nights</span>
                      <p className={styles.tripDate}>🛬 {formatTripDate(returnDate)}</p>

                      <div className={styles.breakdown}>
                        <p>Price breakdown</p>
                        {[0, 1, 2, 3].map((offset) => {
                          const date = new Date(selectedDate);
                          date.setDate(date.getDate() + offset);
                          return (
                            <span key={offset}>
                              {formatTripDate(date).replace(` ${year}`, "")} - ₹{formatPrice(dailyPrice)}
                            </span>
                          );
                        })}
                        {duration > 4 && <button type="button">+ {duration - 4} more nights</button>}
                      </div>

                      <div className={styles.total}>
                        <span>Total ({duration} nights)</span>
                        <strong>₹{formatPrice(total)}</strong>
                      </div>

                      <button
                        type="button"
                        className={styles.bookButton}
                        onClick={() => onBook?.({ departureDate: selectedDate, returnDate, price: total })}
                      >
                        Book Now →
                      </button>
                      <button type="button" className={styles.detailsButton}>View Full Details</button>
                    </aside>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CustomDeparture;
