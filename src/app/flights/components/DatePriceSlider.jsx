"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DatePriceSlider.module.css";
import { ArrowLeft, ArrowRight } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildDateWindow = (startDate, count = 30) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate.getTime() + index * DAY_MS);
    return {
      date,
      dateKey: normalizeDateKey(date),
    };
  });

export default function DatePriceSlider({
  tiles = [],
  selectedDate = "",
  onSelectDate,
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const rowRef = useRef(null);
  const today = useRef(new Date(new Date().setHours(0, 0, 0, 0)));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelectedKey(normalizeDateKey(selectedDate));
  }, [selectedDate]);

  const priceMap = useMemo(
    () =>
      (Array.isArray(tiles) ? tiles : []).reduce((acc, tile) => {
        const dateKey = normalizeDateKey(tile?.date);
        if (!dateKey) return acc;

        const normalizedPrice = Number(tile?.price);
        acc[dateKey] = {
          price: Number.isFinite(normalizedPrice) ? normalizedPrice : null,
          priceType:
            tile?.trend === "up"
              ? "high"
              : tile?.trend === "down"
                ? "low"
                : "normal",
        };
        return acc;
      }, {}),
    [tiles],
  );

  const dates = useMemo(
    () =>
      buildDateWindow(today.current).map((item) => {
        const meta = priceMap[item.dateKey] || {};

        return {
          id: item.dateKey,
          dateKey: item.dateKey,
          label: mounted
            ? item.date.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })
            : "",
          price: meta.price ?? null,
          priceType: meta.priceType || "normal",
        };
      }),
    [mounted, priceMap],
  );

  const scroll = (dir) => {
    if (!rowRef.current) return;

    const cardWidth = 116;
    rowRef.current.scrollBy({
      left: dir === "left" ? -cardWidth * 3 : cardWidth * 3,
      behavior: "smooth",
    });
  };

  const handleSelect = (dateKey) => {
    setSelectedKey(dateKey);
    onSelectDate?.(dateKey);
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.arrow} onClick={() => scroll("left")} type="button">
        <ArrowLeft size={12} />
      </button>

      <div className={styles.datesRow} ref={rowRef}>
        {dates.map((item) => {
          const isSelected = selectedKey === item.dateKey;

          return (
            <button
              key={item.id}
              className={`${styles.dateCard} ${isSelected ? styles.selected : ""}`}
              onClick={() => handleSelect(item.dateKey)}
              type="button"
            >
              <div className={styles.day}>{item.label}</div>
              {item.price !== null ? (
                <div
                  className={`${styles.price} ${
                    item.priceType === "high"
                      ? styles.high
                      : item.priceType === "low"
                        ? styles.low
                        : ""
                  }`}
                >
                  ₹{item.price.toLocaleString()}
                </div>
              ) : (
                <div className={styles.pricePlaceholder} />
              )}
            </button>
          );
        })}
      </div>

      <button className={styles.arrow} onClick={() => scroll("right")} type="button">
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
