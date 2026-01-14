"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./ProfileSection.module.css";
import { useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const ProfileSection = () => {
  const dropdownRef = useRef(null);
  const getUserEmailFromCookie = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return "";
      return JSON.parse(userCookie).email || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileFields((prev) => prev.map((f) => ({ ...f, isOpen: false })));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      value: getUserEmailFromCookie(),
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
  const mapApiToFields = (data) => [
    { label: "Full Name", value: data.full_name || "", isEditing: false },

    {
      label: "Display Name",
      value: data.display_name || "",
      placeholder: "Choose how your name appears across Transpeed.",
      isEditing: false,
    },

    {
      label: "Email Address",
      value: getUserEmailFromCookie(),
      isVerified: true,
      isEditing: false,
    },

    {
      label: "Phone Number",
      value: data.phone || "",
      isEditing: false,
    },

    {
      label: "Date of Birth",
      value: data.date_of_birth || "",
      placeholder: "Add your date of birth",
      isEditing: false,
    },

    {
      label: "Nationality",
      value: data.nationality || "",
      hasFlag: true,
      isEditing: false,
    },

    {
      label: "Passport Details",
      value: data.passport_detail || "",
      placeholder: "Not provided",
      actionText: "Add Passport",
      isEditing: false,
    },

    {
      label: "Address",
      value: data.address || "",
      placeholder: "Add your address",
      isEditing: false,
    },

    {
      label: "Zip Code",
      value: data.zip_code || "",
      placeholder: "Enter Zipcode",
      isEditing: false,
    },

    {
      label: "Country",
      value: data.country || "",
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
  ];

  const buildPayload = () => {
    const get = (label) =>
      profileFields.find((f) => f.label === label)?.value?.trim();

    const payload = {
      full_name: get("Full Name"),
      display_name: get("Display Name"),
      date_of_birth: get("Date of Birth"),
      nationality: get("Nationality"),
      address: get("Address"),
      country: get("Country"),
      zip_code: get("Zip Code"),
      passport_detail: get("Passport Details"),
      profile_completed: true,
    };

    // 🔥 remove empty fields
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    });

    return payload;
  };

  const updateProfile = async () => {
    try {
      const userId = Cookies.get("user_id");
      const token = Cookies.get("auth_token");

      if (!userId) {
        throw new Error("User ID missing in cookies");
      }

      const payload = buildPayload();

      // 🔥 nothing to update
      if (Object.keys(payload).length === 1) {
        toast.info("No changes to update");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${userId}`;

      await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Profile update failed", err.response?.data || err.message);
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = Cookies.get("user_id");
        const token = Cookies.get("auth_token");

        if (!userId) return;

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${userId}`;

        const res = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        // ✅ Prefill fields
        setProfileFields(mapApiToFields(res.data));
      } catch (err) {
        console.error(
          "Failed to fetch profile",
          err.response?.data || err.message
        );
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (index, value) => {
    const updated = [...profileFields];
    updated[index].value = value;
    setProfileFields(updated);
  };

  const toggleEdit = async (index) => {
    const updated = [...profileFields];
    const field = updated[index];

    // If clicking SAVE → call API
    if (field.isEditing) {
      await updateProfile();
    }

    updated[index].isEditing = !field.isEditing;
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
      </div>
    </section>
  );
};

export default ProfileSection;
