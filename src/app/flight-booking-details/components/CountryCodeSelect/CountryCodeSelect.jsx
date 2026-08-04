"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CountryCodes,
  CountryFlagIcon,
} from "@/app/profile/components/profileSection/CountryName";
import styles from "./CountryCodeSelect.module.css";

const COUNTRY_OPTIONS = [...CountryCodes]
  .sort((a, b) => {
    if (a.code === "IN") return -1;
    if (b.code === "IN") return 1;
    return a.name.localeCompare(b.name);
  })
  .map((country) => ({
    code: country.code,
    name: country.name,
    dialCode: country.dial_code,
    searchText: `${country.code} ${country.name || ""} ${country.dial_code || ""}`.toLowerCase(),
  }));

const findCountry = (value) => {
  const normalized = String(value || "").trim();
  return (
    COUNTRY_OPTIONS.find(
      (option) =>
        option.code.toLowerCase() === normalized.toLowerCase() ||
        option.dialCode === normalized ||
        option.dialCode.replace("+", "") === normalized.replace("+", ""),
    ) || COUNTRY_OPTIONS[0]
  );
};

const CountryCodeSelect = ({ value, onChange, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const selectedCountry = findCountry(value);
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? COUNTRY_OPTIONS.filter((option) => option.searchText.includes(query))
      : COUNTRY_OPTIONS;
  }, [search]);

  useEffect(() => {
    if (value !== selectedCountry.code) {
      onChange(selectedCountry.code);
    }
  }, [onChange, selectedCountry.code, value]);

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
        aria-label="Select country code"
        onClick={() => {
          setIsOpen((current) => !current);
          setSearch("");
        }}
      >
        <CountryFlagIcon
          code={selectedCountry.code}
          title={selectedCountry.code}
          className={styles.flag}
        />
        <span>{selectedCountry.code} ({selectedCountry.dialCode})</span>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <input
            autoFocus
            type="text"
            className={styles.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search country"
            aria-label="Search country"
          />
          <div className={styles.options}>
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  title={option.name}
                  className={`${styles.option} ${
                    option.code === selectedCountry.code ? styles.active : ""
                  }`}
                  onClick={() => {
                    onChange(option.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <CountryFlagIcon
                    code={option.code}
                    title={option.code}
                    className={styles.flag}
                  />
                  <span>{option.code} ({option.dialCode})</span>
                  <span className={styles.countryName}>{option.name}</span>
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

export default CountryCodeSelect;
