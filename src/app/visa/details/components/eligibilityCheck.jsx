"use client";

import React, { useCallback, useState } from "react";
import styles from "./eligibilityCheck.module.css";

const travelPurposes = [
  "Tourism",
  "Business",
  "Family Visit",
  "Medical",
  "Education",
];

const CalendarIcon = () => (
  <svg
    className={styles.calendarIcon}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5c0-.92-.746-1.667-1.667-1.667Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.333 1.667V5M6.667 1.667V5M2.5 8.333h15"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertIcon = () => (
  <svg
    className={styles.alertIcon}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M10 18.333A8.333 8.333 0 1 0 10 1.667a8.333 8.333 0 0 0 0 16.666Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 6.667V10M10 13.333h.008"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DateField = ({ id, label, value, onChange, error }) => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor={id}>
      {label}
    </label>
    <div className={styles.inputShell}>
      <input
        id={id}
        className={styles.input}
        type="date"
        value={value}
        onChange={onChange}
      />
      {/* <CalendarIcon /> */}
    </div>
    {error && <p className={styles.fieldError}>{error}</p>}
  </div>
);

const EligibilityCheck = ({ onNext }) => {
  const [formData, setFormData] = useState({
    purpose: "Tourism",
    travelDate: "",
    returnDate: "",
    travelers: "1",
    passportExpiry: "",
  });
  const [errors, setErrors] = useState({});

  const updateField = useCallback((field) => (event) => {
    const { value } = event.target;
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }, []);

  const handleTravelersChange = useCallback((event) => {
    const { value } = event.target;
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setFormData((current) => ({ ...current, travelers: value }));
      setErrors((current) => ({ ...current, travelers: "" }));
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const nextErrors = {};
    if (!formData.purpose) nextErrors.purpose = "Select a purpose of travel.";
    if (!formData.travelDate) nextErrors.travelDate = "Select an intended travel date.";
    if (!formData.returnDate) nextErrors.returnDate = "Select an intended return date.";
    if (!/^[1-9]\d*$/.test(formData.travelers)) {
      nextErrors.travelers = "Enter a positive whole number.";
    }
    if (!formData.passportExpiry) nextErrors.passportExpiry = "Select a passport expiry date.";
    if (formData.travelDate && formData.returnDate && formData.travelDate >= formData.returnDate) {
      nextErrors.returnDate = "Return date must be after the travel date.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onNext?.();
  }, [formData, onNext]);

  return (
    <section className={styles.section} aria-labelledby="eligibility-heading">
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.country}>
              <span className={styles.flag} aria-hidden="true">
                <img src="/icons/vietnamFlag.svg" alt="Country Flag" />
              </span>
              <span>Vietnam</span>
            </div>
            <h2 id="eligibility-heading" className={styles.title}>
              Quick eligibility check
            </h2>
            <p className={styles.subtitle}>
              A Few Questions So We Tailor The Right Form For You.
            </p>
          </header>

          <form className={styles.card}>
            <fieldset className={styles.purposeGroup}>
              <legend className={styles.label}>Purpose of Travel</legend>
              
              {errors.purpose && <p className={styles.fieldError}>{errors.purpose}</p>}
            </fieldset>
            <div className={styles.tabs} role="radiogroup" aria-label="Purpose of Travel">
              {travelPurposes.map((purpose) => (
                <button
                  className={`${styles.tab} ${formData.purpose === purpose ? styles.activeTab : ""}`}
                  type="button"
                  role="radio"
                  aria-checked={formData.purpose === purpose}
                  key={purpose}
                  onClick={() => {
                    setFormData((current) => ({ ...current, purpose }));
                    setErrors((current) => ({ ...current, purpose: "" }));
                  }}
                >
                  {purpose}
                </button>
              ))}
              </div>

            <div className={styles.fields}>
              <div className={styles.row}>
                <DateField
                  id="intended-travel-date"
                  label="Intended Travel Date"
                  value={formData.travelDate}
                  onChange={updateField("travelDate")}
                  error={errors.travelDate}
                />
                <DateField
                  id="intended-return-date"
                  label="Intended Return Date"
                  value={formData.returnDate}
                  onChange={updateField("returnDate")}
                  error={errors.returnDate}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="number-of-travelers">
                    Number of Travelers
                  </label>
                  <input
                    id="number-of-travelers"
                    className={`${styles.inputShell} ${styles.numberInput}`}
                    type="text"
                    value={formData.travelers}
                    onChange={handleTravelersChange}
                    inputMode="numeric"
                    pattern="[1-9][0-9]*"
                  />
                  {errors.travelers && <p className={styles.fieldError}>{errors.travelers}</p>}
                </div>
                <DateField
                  id="passport-expiry-date"
                  label="Passport Expiry Date"
                  value={formData.passportExpiry}
                  onChange={updateField("passportExpiry")}
                  error={errors.passportExpiry}
                />
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.submitButton} type="button" onClick={handleSubmit}>
                Check Eligibility
              </button>
            </div>
          </form>
        </div>

        <p className={styles.helperText}>
          Choosing the correct visa category avoids rejection. Not sure?{" "}
          <a href="#" className={styles.helperLink}>
            Talk to our experts.
          </a>
        </p>

        <div className={styles.notice} role="alert">
          <AlertIcon />
          <p>
            <strong>Attention:</strong> Your passport expires on 12/08/2025. You
            need at least 6 months validity from your travel date to apply.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EligibilityCheck;
