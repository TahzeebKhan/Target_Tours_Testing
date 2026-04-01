"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./ProfileSection.module.css";

const ProfileSection = () => {
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
      value: "United State of America",
      hasFlag: true,
      isEditing: false,
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
      options: [
        "United States",
        "India",
        "United Kingdom",
        "Canada",
        "Australia",
      ],
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
    updated[index].value = option;
    updated[index].isOpen = false;
    setProfileFields(updated);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarCircle}>
            <div className={styles.avatarCircle}>
              <Image
                src="/images/profile1.jpg"
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
              {field.hasFlag && (
                <Image
                  src="/images/us.svg"
                  alt="US Flag"
                  width={20}
                  height={14}
                  className={styles.flagIcon}
                />
              )}

              {field.isDropdown && (
                <Image
                  src="/images/globe.svg"
                  alt="Country"
                  width={18}
                  height={18}
                  className={styles.globeIcon}
                />
              )}

              <input
                type="text"
                className={styles.input}
                value={field.value}
                placeholder={field.placeholder}
                readOnly={!field.isEditing}
                onChange={(e) => handleChange(index, e.target.value)}
              />

              {field.isDropdown && (
                <Image
                  src="/images/chevron-down.svg"
                  alt="Dropdown"
                  width={12}
                  height={12}
                  className={styles.arrowIcon}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileSection;
