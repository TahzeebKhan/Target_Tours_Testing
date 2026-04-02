"use client"
import { ArrowLeft } from "lucide-react";
import styles from "./CalendarMonth.module.css";
import { LeftArrowSVG, RightArrowSVG } from "./SVGFile";

const PRICE = 0;

export default function CalendarMonth({
  month,
  year,
  startDate,
  endDate,
  onDateClick,
  isRightSide,
  onPrev,
  onNext,
  price,
  faresByDate,
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;

    const d = new Date(date);
    const s = new Date(startDate);
    const e = new Date(endDate);

    d.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    return d >= s && d <= e;
  };

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();

  // total cells (6 rows × 7 days)
  const TOTAL_CELLS = 42;

  const isSunday = (y, m, d) => new Date(y, m, d).getDay() === 0;

  const isPastDate = (y, m, d) => {
    const date = new Date(y, m, d);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isRangeStart = (dateStr) =>
    startDate && endDate && dateStr === startDate;

  const isRangeEnd = (dateStr) => startDate && endDate && dateStr === endDate;
  const getPriceClass = (price) => {
    return price < 10 ? styles.priceRed : styles.priceGreen;
  };

  return (
    <div className={styles.month}>
      <div className={styles.header}>
        {!isRightSide && (
          <>
            <div onClick={onPrev} className={styles.arrow}>
              <LeftArrowSVG />
            </div>
            <h4>
              {new Date(year, month).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
          </>
        )}

        {isRightSide && (
          <>
            {" "}
            <h4 className={styles.rightHeading}>
              {new Date(year, month).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <div
              onClick={onNext}
              className={`${styles.arrow} ${styles.arrowRight}`}
            >
              <RightArrowSVG />
            </div>
          </>
        )}
      </div>

      <div className={styles.weekdays}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className={`${d === "Su" ? styles.sunday : ""}`}>
            {d}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
          const dayOffset = index - firstDay + 1;

          // PREVIOUS MONTH DAYS
          if (dayOffset <= 0) {
            const day = prevMonthDays + dayOffset;
            return (
              <div key={`prev-${index}`}>
                <div
                  className={`${styles.cell} ${styles.muted} ${isSunday(prevYear, prevMonth, day) ? styles.sundayDate : ""
                    }`}
                >
                  <span className={styles.day}>{day}</span>
                </div>
              </div>
            );
          }

          // CURRENT MONTH DAYS
          if (dayOffset <= daysInMonth) {
            const day = dayOffset;
            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            const isPast = isPastDate(year, month, day);
            const isSaturday = (y, m, d) => new Date(y, m, d).getDay() === 6;
            const rawApiFare = faresByDate?.[dateStr];
            const parsedApiFare = Number(rawApiFare);
            const hasApiFare = Number.isFinite(parsedApiFare);
            const hasFareMap = Boolean(
              faresByDate && Object.keys(faresByDate).length > 0
            );
            const shownFare = hasApiFare ? parsedApiFare : PRICE;
            const shouldShowFare = shownFare > 0;

            return (
              <div
                key={dateStr}
                className={`
    ${!isPast && isInRange(dateStr) ? styles.range : ""}`}
              >
                {" "}
                <div
                  className={`${styles.cell}
        ${isPast ? styles.muted : ""}
        ${isSunday(year, month, day) ? styles.sundayDate : ""}
        ${isSunday(year, month, day) ? styles.sunday : ""}
        ${isSaturday(year, month, day) ? styles.satuday : ""}
        ${!isPast && dateStr === startDate ? styles.selected : ""}
        ${!isPast && isRangeStart(dateStr) ? styles.RangeStartCell : ""}
        ${!isPast && isRangeEnd(dateStr) ? styles.RangeEndCell : ""}
      `}
                  onClick={!isPast ? () => onDateClick(dateStr) : undefined}
                >
                  <span className={styles.day}>{day}</span>
                  {!isPast && (
                    <>
                 
                    {price && (!hasFareMap || hasApiFare) && shouldShowFare && (
<>
<span className={`${styles.price} ${getPriceClass(shownFare)}`}>
                      ₹ {shownFare}
                    </span>
</>
                    )}
                       </>
                  )}
                  
                </div>
              </div>
            );
          }

          // NEXT MONTH DAYS
          const nextDay = dayOffset - daysInMonth;
          const nextMonth = (month + 1) % 12;
          const nextYear = month === 11 ? year + 1 : year;

          return (
            <div key={`next-${index}`}>
              <div
                className={`${styles.cell} ${styles.muted} ${isSunday(nextYear, nextMonth, nextDay)
                    ? styles.sundayDate
                    : ""
                  }`}
              >
                <span className={styles.day}>{nextDay}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
