"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./EditProfileMobile.module.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 8L22 12L18 16" stroke="white" strokeLinecap="round" />
    <path d="M2 12H22" stroke="white" strokeLinecap="round" />
  </svg>
);

const EditProfileMobile = ({
  profileFields,
  handleChange,
  toggleDropdown,
  selectOption,
  dropdownRef,
  onSave,
}) => {
  const [dob, setDob] = useState(null);

  const formatForBackend = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className={styles.grid}>
      {profileFields.map((field, index) => (
        <div key={index} className={styles.fieldWrapper}>
          {/* ✅ LABEL (Edit button REMOVED) */}
          <div className={styles.fieldHeader}>
            <label className={styles.label}>
              {field.label} {field.label === "Full Name" ? "*" : ""}
            </label>
          </div>

          {/* ✅ INPUT CONTAINER */}
          <div className={styles.inputContainer}>
            {field.isDropdown && (
              <Image
                src="/images/globe.svg"
                alt="Country"
                width={18}
                height={18}
                className={styles.globeIcon}
              />
            )}

            {/* ✅ DROPDOWN */}
            {field.isDropdown ? (
              <div
                className={styles.dropdownInput}
                onClick={() => toggleDropdown(index)}
              >
                <span>{field.value}</span>
                <Image
                  src="/images/chevron-down.svg"
                  alt="Dropdown"
                  width={12}
                  height={12}
                  className={styles.arrowIcon}
                />
              </div>
            ) : field.label === "Date of Birth" ? (
              /* ✅ DATE PICKER */
              <Popover>
                <PopoverTrigger asChild>
                  <button className={styles.input} type="button">
                    {field.value || "Select date"}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  className="w-auto p-0"
                >
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={(date) => {
                      setDob(date);
                      handleChange(index, formatForBackend(date));
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              /* ✅ NORMAL INPUT */
              <input
                type="text"
                className={styles.input}
                value={field.value}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            )}

            {/* ✅ DROPDOWN MENU */}
            {field.isDropdown && field.isOpen && (
              <div className={styles.dropdownMenu} ref={dropdownRef}>
                {field.options.map((option) => (
                  <div
                    key={option}
                    className={`${styles.dropdownItem} ${
                      option === field.value ? styles.selectedItem : ""
                    }`}
                    onClick={() => selectOption(index, option)}
                  >
                    <span>{option}</span>
                    {option === field.value && (
                      <Image
                        src="/icons/check.svg"
                        alt="Selected"
                        width={16}
                        height={16}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ✅ SAVE BUTTON (UNCHANGED) */}
      <button onClick={onSave} type="button" className={styles.saveChangesBtn}>
        Save Details <ArrowIcon />
      </button>
    </div>
  );
};

export default EditProfileMobile;
