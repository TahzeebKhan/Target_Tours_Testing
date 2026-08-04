"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Nationality } from "@/app/flight-booking-details/utils/Nationality";
import { CountryFlagIcon } from "@/app/profile/components/profileSection/CountryName";
import styles from "./NationalitySelect.module.css";

const NATIONALITY_OPTIONS = [...Nationality]
  .sort((a, b) => {
    if (a.Isocode === "IN") return -1;
    if (b.Isocode === "IN") return 1;
    return a.country.localeCompare(b.country);
  })
  .map((item) => ({
    ...item,
    searchText: `${item.Isocode} ${item.country} ${item.nationality}`.toLowerCase(),
  }));

const findNationality = (value) =>
  NATIONALITY_OPTIONS.find(
    (option) => option.Isocode.toLowerCase() === String(value || "").trim().toLowerCase(),
  ) || NATIONALITY_OPTIONS[0];

const NationalitySelect = ({ value, onChange, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const selected = findNationality(value);
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? NATIONALITY_OPTIONS.filter((option) => option.searchText.includes(query))
      : NATIONALITY_OPTIONS;
  }, [search]);

  useEffect(() => {
    if (value !== selected.Isocode) onChange(selected.Isocode);
  }, [onChange, selected.Isocode, value]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`${styles.dropdown} ${hasError ? styles.error : ""}`}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-label="Select nationality"
        onClick={() => {
          setIsOpen((current) => !current);
          setSearch("");
        }}
      >
        <CountryFlagIcon
          code={selected.Isocode}
          title={selected.country}
          className={styles.flag}
        />
        <span>{selected.nationality}</span>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <input
            autoFocus
            type="text"
            className={styles.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search nationality or country"
            aria-label="Search nationality or country"
          />
          <div className={styles.options}>
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.Isocode}
                  type="button"
                  className={`${styles.option} ${
                    option.Isocode === selected.Isocode ? styles.active : ""
                  }`}
                  onClick={() => {
                    onChange(option.Isocode);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <CountryFlagIcon
                    code={option.Isocode}
                    title={option.country}
                    className={styles.flag}
                  />
                  <span className={styles.isoCode}>{option.Isocode}</span>
                  <span>{option.nationality}</span>
                </button>
              ))
            ) : (
              <p className={styles.noResult}>No result</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalitySelect;
