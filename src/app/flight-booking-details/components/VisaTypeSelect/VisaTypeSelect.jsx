"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./VisaTypeSelect.module.css";

const VISA_TYPES = [
  "Tourist Visa",
  "Visiting Visa",
  "Business Visa",
  "Transit Visa",
  "Student Visa",
];

const VisaTypeSelect = ({ value, onChange, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const firstOptionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const selectOption = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`${styles.dropdown} ${hasError ? styles.error : ""}`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${value ? "" : styles.placeholder}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (["ArrowDown", "Enter", " "].includes(event.key) && !isOpen) {
            event.preventDefault();
            setIsOpen(true);
            window.requestAnimationFrame(() => firstOptionRef.current?.focus());
          }
        }}
      >
        <span>{value || "Select Visa Type"}</span>
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox" aria-label="Visa Type">
          {VISA_TYPES.map((option, index) => (
            <button
              ref={index === 0 ? firstOptionRef : null}
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              className={`${styles.option} ${value === option ? styles.active : ""}`}
              onClick={() => selectOption(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisaTypeSelect;
