"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./SortDropdown.module.css";
import { ChevronDown } from "lucide-react";

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
      <button className={styles.trigger} onClick={() => setOpen((p) => !p)}>
        {selected}
        <span className={`${styles.arrow} ${open ? styles.rotate : ""}`}>
          {" "}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.35353 10.8535C8.15827 11.0488 7.84173 11.0488 7.64647 10.8535L2.64645 5.85355C2.45118 5.65829 2.45118 5.34171 2.64645 5.14645C2.84171 4.95118 3.15829 4.95118 3.35355 5.14645L8 9.79286L12.6465 5.14645C12.8417 4.95118 13.1583 4.95118 13.3535 5.14645C13.5488 5.34171 13.5488 5.65829 13.3535 5.85355L8.35353 10.8535Z"
              fill="black"
            />
          </svg>
        </span>
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
