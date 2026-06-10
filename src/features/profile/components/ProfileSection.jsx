"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./ProfileSection.module.css";
import {
  CountryFlagIcon,
  countryList,
  getNationalityCountryCode,
  NationalityList,
} from "@/app/profile/components/profileSection/CountryName";

const ProfileSection = () => {
  const [dropdownSearch, setDropdownSearch] = useState({});
  const [profileFields, setProfileFields] = useState([
    { label: "Full Name", value: "Demian Satria", isEditing: false },
    {
      label: "Display Name",
      value: "",
      placeholder: "Choose how your name appears across Transpeed.",
      isEditing: false,
    },
    {
      label: "Email Address",
      value: "demiansatria@gmail.com",
      isVerified: true,
      isEditing: false,
    },
    { label: "Phone Number", value: "0892-1293-3941", isEditing: false },
    {
      label: "Date of Birth",
      value: "",
      placeholder: "Add your date of birth",
      isEditing: false,
    },
    {
      label: "Nationality",
      value: "American",
      hasFlag: true,
      isDropdown: true,
      isEditing: false,
      isOpen: false,
      options: NationalityList,
    },
    {
      label: "Passport Details",
      value: "",
      placeholder: "Not provided",
      actionText: "Add Passport",
      isEditing: false,
    },
    {
      label: "Address",
      value: "",
      placeholder: "Add your address",
      isEditing: false,
    },
    {
      label: "Zip Code",
      value: "",
      placeholder: "Enter Zipcode",
      isEditing: false,
    },
    {
      label: "Country",
      value: "United States",
      isDropdown: true,
      isEditing: false,
      isOpen: false,
      options: countryList,
    },
  ]);

  const handleChange = (index, value) => {
    const updated = [...profileFields];
    updated[index].value = value;
    setProfileFields(updated);
  };

  const toggleEdit = (index) => {
    const updated = [...profileFields];
    updated[index].isEditing = !updated[index].isEditing;
    setProfileFields(updated);
  };

  const toggleDropdown = (index) => {
    const updated = [...profileFields];
    updated[index].isOpen = !updated[index].isOpen;
    setProfileFields(updated);
  };

  const selectOption = (index, option) => {
    const updated = [...profileFields];
    updated[index].value = getOptionLabel(option);
    updated[index].isOpen = false;
    setProfileFields(updated);

    setDropdownSearch((prev) => {
      const next = { ...prev };
      delete next[updated[index].label];
      return next;
    });
  };

  const getOptionLabel = (option) =>
    typeof option === "string" ? option : option?.nationality || option?.name || "";

  const getOptionSearchText = (option) =>
    typeof option === "string"
      ? option
      : `${option?.nationality || ""} ${option?.name || ""}`;

  const getFilteredOptions = (field) => {
    const search = dropdownSearch[field.label]?.trim().toLowerCase() || "";
    const options = field.options || [];

    if (!search) return options;

    return options.filter((option) =>
      getOptionSearchText(option).toLowerCase().includes(search)
    );
  };

  const getFieldFlag = (field) => {
    const fieldValue = String(field.value || "").trim().toLowerCase();
    const match = field.options?.find((option) => {
      const label = getOptionLabel(option).toLowerCase();
      const name = String(option?.name || "").toLowerCase();
      const nationality = String(option?.nationality || "").toLowerCase();

      return (
        label === fieldValue ||
        name === fieldValue ||
        nationality === fieldValue
      );
    });

    return getNationalityCountryCode(match) || getNationalityCountryCode(field.value);
  };

  const getOptionFlag = (option) => getNationalityCountryCode(option);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarCircle}>
            <div className={styles.avatarCircle}>
              <Image
                src="/images/profilePlaceholder.avif"
                alt="Profile Avatar"
                fill
                className={styles.avatar}
                sizes="102px"
              />
            </div>
          </div>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>
              Keep your details up to date to make your bookings and travel
              smoother.
            </p>
            <button className={styles.changePhotoBtn}>Change photo</button>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {profileFields.map((field, index) => (
          <div key={index} className={styles.fieldWrapper}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>{field.label}</label>

              {field.isVerified && (
                <span className={styles.verifiedBadge}>Verified</span>
              )}

              <button
                className={styles.editBtn}
                onClick={() => toggleEdit(index)}
              >
                {field.isEditing ? "Save" : field.actionText || "Edit"}
              </button>
            </div>

            <div className={styles.inputContainer}>
              {field.isDropdown && getFieldFlag(field) ? (
                <CountryFlagIcon
                  code={getFieldFlag(field)}
                  title={field.value}
                  className={styles.flagEmoji}
                />
              ) : field.isDropdown && !field.hasFlag ? (
                <Image
                  src="/images/globe.svg"
                  alt="Country"
                  width={18}
                  height={18}
                  className={styles.globeIcon}
                />
              ) : null}

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
              ) : (
                <input
                  type="text"
                  className={styles.input}
                  value={field.value}
                  placeholder={field.placeholder}
                  readOnly={!field.isEditing}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              )}

              {field.isDropdown && field.isOpen && (
                <div className={styles.dropdownMenu}>
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
                          getOptionLabel(option) === field.value
                            ? styles.selectedItem
                            : ""
                        }`}
                        onClick={() => selectOption(index, option)}
                      >
                        <span className={styles.dropdownOptionLabel}>
                          {getOptionFlag(option) && (
                            <CountryFlagIcon
                              code={getOptionFlag(option)}
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
      </div>
    </section>
  );
};

export default ProfileSection;
