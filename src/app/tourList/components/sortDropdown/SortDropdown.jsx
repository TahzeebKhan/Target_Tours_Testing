"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./SortDropdown.module.css";

const OPTIONS = [
  { label: "MOST RECENT", value: "recent" },
  { label: "POPULAR", value: "popular" },
  { label: "LOW TO HIGH", value: "low_to_high" },
  { label: "HIGH TO LOW", value: "high_to_low" },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected =
    OPTIONS.find((o) => o.value === value)?.label || "MOST RECENT";

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((p) => !p)}
      >
        {selected}
        <span className={`${styles.arrow} ${open ? styles.rotate : ""}`} />
      </button>

      {open && (
        <div className={styles.menu}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={styles.option}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
