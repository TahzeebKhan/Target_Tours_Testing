"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./DatePriceSlider.module.css";
import { ArrowLeft, ArrowRight } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

const generateDates = (startDate, count = 40) => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate.getTime() + i * DAY_MS);
    return {
      id: date.toISOString(),
      date,
      price: 7324,
      priceType: i === 6 || i === 7 ? "high" : i === 0 ? "normal" : "low",
    };
  });
};

export default function DatePriceSlider() {
  const [startDate, setStartDate] = useState(new Date());
  const [selected, setSelected] = useState([]);

  // const dates = generateDates(new Date());
  const rowRef = useRef(null);

  const today = useRef(new Date(new Date().setHours(0, 0, 0, 0)));

  const dates = generateDates(today.current);

  const scroll = (dir) => {
    if (!rowRef.current) return;

    const CARD_WIDTH = 116; // card width + gap
    rowRef.current.scrollBy({
      left: dir === "left" ? -CARD_WIDTH * 3 : CARD_WIDTH * 3,
      behavior: "smooth",
    });
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const shiftLeft = () => {
    setStartDate((d) => new Date(d.getTime() - DAY_MS));
  };

  // const shiftRight = () => {
  //   setStartDate((d) => new Date(d.getTime() + DAY_MS));
  // };
  useEffect(() => {
    selected.forEach((s) => {
      console.log("sel=>", s);
    });
  }, [selected]);

  return (
    <div className={styles.wrapper}>
      <button className={styles.arrow} onClick={() => scroll("left")}>
        <ArrowLeft size={12} />
      </button>

      <div className={styles.datesRow} ref={rowRef}>
        {dates.map((d) => {
          const isSelected = selected.includes(d.id);

          return (
            <button
              key={d.id}
              className={`${styles.dateCard} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => toggleSelect(d.id)}
              type="button"
            >
              <div className={styles.day}>
                {d.date.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })}
              </div>

              <div
                className={`${styles.price} ${
                  d.priceType === "high"
                    ? styles.high
                    : d.priceType === "low"
                    ? styles.low
                    : ""
                }`}
              >
                ₹{d.price.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>

      <button className={styles.arrow} onClick={() => scroll("right")}>
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
