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
import {
  CountryFlagIcon,
  getNationalityCountryCode,
  NationalityList,
} from "./CountryName";

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
  const [dropdownSearch, setDropdownSearch] = useState({});

  const formatForBackend = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const getFilteredOptions = (field) => {
    const search = dropdownSearch[field.label]?.trim().toLowerCase() || "";
    const options = field.options || [];

    if (!search) return options;

    return options.filter((option) =>
      getOptionSearchText(option).toLowerCase().includes(search)
    );
  };

  const getOptionLabel = (option) =>
    typeof option === "string" ? option : option?.nationality || option?.name || "";

  const getOptionSearchText = (option) =>
    typeof option === "string"
      ? option
      : `${option?.nationality || ""} ${option?.name || ""}`;

  const getOptionFlag = (option) => getNationalityCountryCode(option);

  const getDropdownOptionFlag = (option, field) => {
    const directFlag = getOptionFlag(option);
    if (directFlag) return directFlag;

    if (!field.hasFlag) return "";

    const optionLabel = getOptionLabel(option).toLowerCase();
    const match = NationalityList.find(
      (item) =>
        String(item.nationality || "").toLowerCase() === optionLabel ||
        String(item.name || "").toLowerCase() === optionLabel
    );

    return getNationalityCountryCode(match);
  };

  const getFieldFlag = (field) => {
    const fieldValue = String(field.value || "").trim().toLowerCase();
    const option = field.options?.find(
      (item) =>
        getOptionLabel(item).toLowerCase() === fieldValue ||
        String(item?.nationality || "").toLowerCase() === fieldValue ||
        String(item?.name || "").toLowerCase() === fieldValue
    );

    return getOptionFlag(option) || getNationalityCountryCode(field.value);
  };

  const handleSelectOption = (index, field, option) => {
    selectOption(index, getOptionLabel(option));
    setDropdownSearch((prev) => {
      const next = { ...prev };
      delete next[field.label];
      return next;
    });
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
            {field.isDropdown && getFieldFlag(field) ? (
              <CountryFlagIcon
                code={getFieldFlag(field)}
                title={field.value}
                className={styles.flagEmoji}
              />
            ) : field.isDropdown ? (
              <Image
                src="/images/globe.svg"
                alt="Country"
                width={18}
                height={18}
                className={styles.globeIcon}
              />
            ) : null}

            {/* ✅ DROPDOWN */}
            {field.isDropdown ? (
              <div
                className={`${styles.dropdownInput} ${
                  field.isLocked ? styles.disabledField : ""
                }`}
                onClick={() => toggleDropdown(index)}
                aria-disabled={field.isLocked}
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
                disabled={field.isLocked}
                readOnly={field.isLocked}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            )}

            {/* ✅ DROPDOWN MENU */}
            {field.isDropdown && field.isOpen && !field.isLocked && (
              <div className={styles.dropdownMenu} ref={dropdownRef}>
                <div className={styles.dropdownSearchWrap}>
                  <input
                    className={styles.dropdownSearchInput}
                    type="text"
                    value={dropdownSearch[field.label] || ""}
                    placeholder={`Search ${field.label.toLowerCase()}`}
                    onChange={(e) =>
                      setDropdownSearch((prev) => ({
                        ...prev,
                        [field.label]: e.target.value,
                      }))
                    }
                  />
                </div>

                {getFilteredOptions(field).length > 0 ? (
                  getFilteredOptions(field).map((option) => (
                    <div
                      key={getOptionLabel(option)}
                      className={`${styles.dropdownItem} ${
                        getOptionLabel(option) === field.value ? styles.selectedItem : ""
                      }`}
                      onClick={() => handleSelectOption(index, field, option)}
                    >
                      <span className={styles.dropdownOptionLabel}>
                        {getDropdownOptionFlag(option, field) && (
                          <CountryFlagIcon
                            code={getDropdownOptionFlag(option, field)}
                            title={getOptionLabel(option)}
                            className={styles.flagEmoji}
                          />
                        )}
                        {getOptionLabel(option)}
                      </span>
                      {getOptionLabel(option) === field.value && (
                        <Image
                          src="/icons/check.svg"
                          alt="Selected"
                          width={16}
                          height={16}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.noDropdownResults}>
                    No results found
                  </div>
                )}
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
