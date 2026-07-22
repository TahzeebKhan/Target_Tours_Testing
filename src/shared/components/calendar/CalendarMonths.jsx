"use client";
import { useState } from "react";
import CalendarMonth from "./CalendarMonth";
import styles from "./CalendarMonths.module.css";

export default function CalendarMonths({
  startDate,
  endDate,
  onDateClick,
  price,
  faresByDate,
}) {
  // base month = LEFT calendar
  const [baseDate, setBaseDate] = useState(new Date());

  const baseMonth = baseDate.getMonth();
  const baseYear = baseDate.getFullYear();

  const goPrev = () => {
    setBaseDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goNext = () => {
    setBaseDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  return (
    <div className={styles.months}>
      {/* LEFT MONTH */}
      <CalendarMonth
        month={baseMonth}
        year={baseYear}
        startDate={startDate}
        endDate={endDate}
        onDateClick={onDateClick}
        price={price}
        faresByDate={faresByDate}
        onPrev={goPrev}
        isRightSide={false}
      />

      {/* RIGHT MONTH = next month */}
      <CalendarMonth
        month={(baseMonth + 1) % 12}
        year={baseMonth === 11 ? baseYear + 1 : baseYear}
        startDate={startDate}
        endDate={endDate}
        onDateClick={onDateClick}
        price={price}
        faresByDate={faresByDate}
        onNext={goNext}
        isRightSide={true}
      />
    </div>
  );
}
