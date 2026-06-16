"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./ProfileSection.module.css";
import { useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "@/app/context/AuthContext";
import { Pencil } from "lucide-react";
import EditProfileMobile from "./EditProfileMobile";
import {
  CountryFlagIcon,
  CountryCodes,
  countryList,
  getNationalityCountryCode,
  NationalityList,
  nationalityAliasToIso,
} from "./CountryName";

const countryNameByCode = NationalityList.reduce((countryMap, item) => {
  if (item.iso && item.name) {
    countryMap[item.iso] = item.name;
  }

  return countryMap;
}, {});

const countryAliasSearchByCode = Object.entries(nationalityAliasToIso).reduce(
  (countryMap, [alias, code]) => {
    if (!/^[A-Z]{2}$/.test(code)) return countryMap;

    countryMap[code] = `${countryMap[code] || ""} ${alias}`.trim();
    return countryMap;
  },
  {},
);

const COUNTRY_OPTIONS = [...CountryCodes]
  .sort((a, b) => {
    if (a.code === "IN") return -1;
    if (b.code === "IN") return 1;
    return a.name.localeCompare(b.name);
  })
  .map((country) => ({
    code: country.code,
    name: country.name || countryNameByCode[country.code] || country.code,
    dialCode: country.dial_code,
    searchText: `${country.code} ${country.name || ""} ${country.dial_code || ""} ${
      countryAliasSearchByCode[country.code] || ""
    }`.toLowerCase(),
    maxLength: country.code === "IN" || country.code === "US" ? 10 : 15,
  }));

const getPhoneCountryCode = (value, fallbackCountry) => {
  const normalizedValue = String(value || "").trim().toUpperCase();
  const normalizedFallback = String(fallbackCountry || "").trim().toUpperCase();

  if (/^[A-Z]{2}$/.test(normalizedValue)) return normalizedValue;

  const dialMatches = COUNTRY_OPTIONS.filter(
    (option) => option.dialCode === normalizedValue,
  );

  if (dialMatches.length === 1) return dialMatches[0].code;
  if (dialMatches.some((option) => option.code === normalizedFallback)) {
    return normalizedFallback;
  }

  return dialMatches[0]?.code || normalizedFallback || "IN";
};

const ProfileSection = () => {
  const fileInputRef = useRef(null);
  const { setProfilePhoto, setActiveMenu, activeMenu } = useProfile();
  const [phoneError, setPhoneError] = useState(false);
  const { setProfile, profile, user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState("/images/profilePlaceholder.avif");
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [dropdownSearch, setDropdownSearch] = useState({});

  const [editMode, setEditMode] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [isPhoneCountryDropdownOpen, setIsPhoneCountryDropdownOpen] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState("");
  const phoneCountryDropdownRef = useRef(null);
  const selectedPhoneCountry =
    COUNTRY_OPTIONS.find((option) => option.code === phoneCountry) ||
    COUNTRY_OPTIONS[0];
  const filteredPhoneCountryOptions = phoneCountrySearch.trim()
    ? COUNTRY_OPTIONS.filter((option) =>
        option.searchText.includes(phoneCountrySearch.trim().toLowerCase()),
      )
    : COUNTRY_OPTIONS;

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };
  const isValidPhoneNumber = (phone) => {
    if (phoneCountry === "IN") {
      return /^[6-9]\d{9}$/.test(phone);
    }

    return /^\d{6,15}$/.test(phone);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    const userId = Cookies.get("user_id");
    const token = Cookies.get("auth_token");

    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("profile_photo", file); // ✅ backend key
      if (!userId) {
        console.log("user id not in cookies");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/profile-photo/${userId}`;

      const res = await axios.post(url, formData, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      // Preview after success
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      // setAvatarPreview(
      //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/user_profile_picture/${res.data.profile_photo}`
      // );
      setProfilePhoto(previewUrl);
      toast.success("Profile photo updated successfully");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to upload profile photo";
      setAvatarPreview(URL.createObjectURL(file));

      toast.error(message);
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  const dropdownRef = useRef(null);
  const [dob, setDob] = useState(null);
  const formatForBackend = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const parseFromBackend = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

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
        setDropdownSearch({});
      }

      if (
        phoneCountryDropdownRef.current &&
        !phoneCountryDropdownRef.current.contains(e.target)
      ) {
        setIsPhoneCountryDropdownOpen(false);
        setPhoneCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [profileFields, setProfileFields] = useState([
    { label: "Full Name", value: "", isEditing: false },
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

    { label: "Phone Number", value: "", isEditing: false },
    {
      label: "Date of Birth",
      value: "",
      placeholder: "Add your date of birth",
      isEditing: false,
    },
    {
      label: "Nationality",
      value: "",
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

  const corporateMobileFields = [
    {
      label: "Hotel Budget for Each Booking",
      value: profile?.hotel_budget || "₹ 0",
    },
    {
      label: "Flight Budget for Each Booking",
      value: profile?.flight_budget || "₹ 0",
    },
  ];

  const normalizeCountryText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*\[[^\]]*\]/g, "")
      .replace(/\bthe\b/g, "")
      .replace(/[^a-z0-9]/g, "");

  const getCountryCodeFromValue = (value) => {
    const countryValue = String(value || "").trim();
    if (!countryValue) return "";

    const upperValue = countryValue.toUpperCase();
    if (/^[A-Z]{2}$/.test(upperValue)) return upperValue;

    const directCode = getNationalityCountryCode(countryValue);
    if (/^[A-Z]{2}$/.test(directCode)) return directCode;

    const normalizedValue = normalizeCountryText(countryValue);
    const countryMatch = NationalityList.find(
      (item) =>
        normalizeCountryText(item.name) === normalizedValue ||
        normalizeCountryText(item.nationality) === normalizedValue
    );

    if (countryMatch?.iso) return countryMatch.iso;

    if (normalizedValue === "usa" || normalizedValue === "unitedstatesofamerica") {
      return "US";
    }

    return "";
  };

  const getCountryDisplayValue = (country, countryCode) => {
    const countryValue = String(country || "").trim();
    const code = getCountryCodeFromValue(countryCode || countryValue);

    if (code) {
      const match = NationalityList.find((item) => item.iso === code);
      return match?.name || countryValue;
    }

    if (normalizeCountryText(countryValue) === "usa") return "United States";

    return countryValue;
  };

  const mapApiToFields = (data) => [
    { label: "Full Name", value: data.full_name || "", isEditing: false },

    {
      label: "Display Name",
      value:
        data.display_name ||  "",
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
      value: data.phone_no || "",
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
      isDropdown: true,
      isEditing: false,
      isOpen: false,
      options: NationalityList,
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
      value: getCountryDisplayValue(data.country, data.country_code),
      isDropdown: true,
      isEditing: false,
      isOpen: false,
      options: countryList,
    },
  ];

  const [corporateFields, setCorporateFields] = useState({
    hotelBudget: "",
    flightBudget: "",
  });

  useEffect(() => {
    if (!profile) return;

    setProfileFields(mapApiToFields(profile));
    setDob(parseFromBackend(profile.date_of_birth));
    setPhoneCountry(
      getPhoneCountryCode(
        profile.dail_code,
        getCountryCodeFromValue(profile.country_code || profile.country),
      )
    );
    setAvatarPreview(getProfilePhotoUrl(profile.profile_photo));
    setProfilePhoto(getProfilePhotoUrl(profile.profile_photo));
  }, [profile]);

  const buildPayload = () => {
    const get = (label) => {
      const value = profileFields.find((f) => f.label === label)?.value;

      return typeof value === "string" ? value.trim() : "";
    };
    const countryValue = get("Country");
    const countryCode = getCountryCodeFromValue(countryValue);

    const payload = {
      full_name: get("Full Name"),
      display_name: get("Display Name"),
      date_of_birth: get("Date of Birth"),
      nationality: get("Nationality"),
      address: get("Address"),
      country: countryCode || countryValue,
      dail_code: selectedPhoneCountry.dialCode,
      zip_code: get("Zip Code"),
      passport_detail: get("Passport Details"),
      phone_no: get("Phone Number"), // ✅ FIX
      profile_photo: null, // ✅ SAFE
      profile_completed: true,
    };

    // Keep empty strings so users can clear saved profile fields.
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined) {
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
        console.log("User ID missing in cookies");
        return false;
      }

      const phone = profileFields
        .find((f) => f.label === "Phone Number")
        ?.value?.trim();

      // 🔥 PHONE VALIDATION
      if (phone && !isValidPhoneNumber(phone)) {
        setPhoneError(true);
        toast.error("Enter a valid phone number");
        return false;
      }

      setPhoneError(false);
      const payload = buildPayload();

      // 🔥 nothing to update
      if (Object.keys(payload).length === 1) {
        toast.info("No changes to update");
        return true;
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${userId}`;

      const res = await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const responseProfile = res?.data?.data || res?.data || {};
      const nextProfile = {
        ...(profile || {}),
        ...responseProfile,
        ...payload,
      };

      setProfile(nextProfile);

      const expiresAt = Number(Cookies.get("auth_expires_at"));
      Cookies.set("user_profile", JSON.stringify(nextProfile), {
        ...(Number.isFinite(expiresAt) && { expires: new Date(expiresAt) }),
      });

      toast.success("Profile updated successfully");
      return true;
    } catch (err) {
      const errorData = err.response?.data;
      const message =
        errorData?.error?.message ||
        errorData?.message ||
        errorData?.error?.details?.message ||
        err.message ||
        "Failed to update profile";

      console.error("Profile update failed", errorData || err.message);
      toast.error(message);
      return false;
    }
  };

  const closeProfileEditing = () => {
    setEditMode(false);
    setProfileFields((prev) =>
      prev.map((field) => ({ ...field, isEditing: false, isOpen: false }))
    );
    setDropdownSearch({});
  };

  const openProfileEditing = () => {
    setEditMode(true);
    setProfileFields((prev) =>
      prev.map((field) => ({ ...field, isEditing: true, isOpen: false }))
    );
    setDropdownSearch({});
  };

  const handleProfileSave = async () => {
    const saved = await updateProfile();
    if (saved !== false) {
      closeProfileEditing();
    }
  };

  const handleProfileGoBack = () => {
    closeProfileEditing();
    setActiveMenu("Personal Information");
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
        setDob(parseFromBackend(res.data.date_of_birth));
        setPhoneCountry(
          getPhoneCountryCode(
            res.data.dail_code,
            getCountryCodeFromValue(res.data.country_code || res.data.country),
          )
        );
        // 🔥 MAP PROFILE PHOTO
        setAvatarPreview(getProfilePhotoUrl(res.data.profile_photo));
        setProfilePhoto(getProfilePhotoUrl(res.data.profile_photo));
      } catch (err) {
        console.error(
          "Failed to fetch profile",
          err.response?.data || err.message,
        );

        if (profile) {
          setProfileFields(mapApiToFields(profile));
          setDob(parseFromBackend(profile.date_of_birth));
          setPhoneCountry(
            getPhoneCountryCode(
              profile.dail_code,
              getCountryCodeFromValue(profile.country_code || profile.country),
            )
          );
          setAvatarPreview(getProfilePhotoUrl(profile.profile_photo));
          setProfilePhoto(getProfilePhotoUrl(profile.profile_photo));
        }
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (index, value) => {
    const updated = [...profileFields];
    updated[index].value =
      updated[index].label === "Phone Number"
        ? value.replace(/[^\d]/g, "").slice(0, selectedPhoneCountry.maxLength)
        : value;
    setProfileFields(updated);

    if (validationErrors[updated[index].label]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[updated[index].label];
        return next;
      });
    }
  };

  const toggleDropdown = (index) => {
    const updated = [...profileFields];
    if (!updated[index].isEditing) return;

    updated[index].isOpen = !updated[index].isOpen;
    if (!updated[index].isOpen) {
      setDropdownSearch((prev) => {
        const next = { ...prev };
        delete next[updated[index].label];
        return next;
      });
    }
    setProfileFields(updated);
  };

  const selectOption = (index, option) => {
    const updated = [...profileFields];
    updated[index].value = option;
    updated[index].isOpen = false;
    setProfileFields(updated);
    setDropdownSearch((prev) => {
      const next = { ...prev };
      delete next[updated[index].label];
      return next;
    });

    if (validationErrors[updated[index].label]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[updated[index].label];
        return next;
      });
    }
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

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return "/images/profilePlaceholder.avif"; // fallback avatar
    if (/^https?:\/\//i.test(photo)) return photo;

    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/user_profile_picture/${photo}`;
  };
  // const [avatarPreview, setAvatarPreview] = useState("/images/profilePlaceholder.avif");
  const handleCorporateChange = (key, value) => {
    setCorporateFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleEditProfile = () => {
    openProfileEditing();
  };

  const isCorporate = false;
  return (
    <>
      <section className={styles.container}>
        <header className={styles.header}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircle}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={handlePhotoSelect}
              />

              <div className={styles.avatarCircle}>
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar"
                  fill
                  className={styles.avatar}
                  sizes="102px"
                  onError={() => setAvatarPreview("/images/profilePlaceholder.avif")}
                />
              </div>
            </div>

            <div className={styles.titleGroup}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>My Profile</h1>
                {!editMode && (
                  <button className={styles.editProfileBtn} onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                )}
              </div>
              <p className={styles.subtitle}>
                Keep your details up to date to make your bookings and travel
                smoother.
              </p>
              <button
                className={styles.changePhotoBtn}
                onClick={handleChangePhotoClick}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Change photo"}
              </button>
            </div>
          </div>
        </header>

        <div className={styles.formPanel}>
          <div className={styles.grid}>
            {profileFields.map((field, index) => (
              <div key={index} className={`${styles.fieldWrapper}`}>
                <div className={styles.fieldHeader}>
                  <label className={styles.label}>{field.label}</label>

                  {field.isVerified && (
                    <span className={styles.verifiedBadge}>Verified</span>
                  )}

                </div>

                <div
                  className={`${styles.inputContainer} ${
                    validationErrors[field.label] ||
                    (field.label === "Phone Number" && phoneError)
                      ? styles.inputError
                      : ""
                  } ${field.label === "Phone Number" ? styles.phoneContainer : ""}`}
                >
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
                  ) : field.label === "Phone Number" ? (
                    <div
                      className={`${styles.phoneInputWrap} ${
                        phoneError ? styles.inputError : ""
                      }`}
                    >
                      <div
                        className={styles.countryDropdown}
                        ref={phoneCountryDropdownRef}
                      >
                        <button
                          type="button"
                          className={styles.countryTrigger}
                          aria-expanded={isPhoneCountryDropdownOpen}
                          aria-label="Select country code"
                          disabled={!editMode}
                          onClick={() => {
                            if (!editMode) return;
                            setIsPhoneCountryDropdownOpen((current) => !current);
                            setPhoneCountrySearch("");
                          }}
                        >
                          <CountryFlagIcon
                            code={phoneCountry}
                            title={phoneCountry}
                            className={styles.countryFlag}
                          />
                          <span>{selectedPhoneCountry.dialCode}</span>
                        </button>

                        {isPhoneCountryDropdownOpen && editMode && (
                          <div className={styles.countryMenu}>
                            <input
                              type="text"
                              className={styles.countrySearch}
                              value={phoneCountrySearch}
                              onChange={(e) => setPhoneCountrySearch(e.target.value)}
                              placeholder="Search country"
                              aria-label="Search country"
                            />

                            <div className={styles.countryOptionsList}>
                              {filteredPhoneCountryOptions.length > 0 ? (
                                filteredPhoneCountryOptions.map((option) => (
                                  <button
                                    key={option.code}
                                    type="button"
                                    title={option.name}
                                    className={`${styles.countryOption} ${
                                      option.code === phoneCountry
                                        ? styles.countryOptionActive
                                        : ""
                                    }`}
                                    onClick={() => {
                                      setPhoneCountry(option.code);
                                      setIsPhoneCountryDropdownOpen(false);
                                      setPhoneCountrySearch("");
                                      handleChange(
                                        index,
                                        String(field.value || "")
                                          .replace(/[^\d]/g, "")
                                          .slice(0, option.maxLength),
                                      );
                                      setPhoneError(false);
                                    }}
                                  >
                                    <CountryFlagIcon
                                      code={option.code}
                                      title={option.code}
                                      className={styles.countryFlag}
                                    />
                                    <span>{option.dialCode}</span>
                                  </button>
                                ))
                              ) : (
                                <p className={styles.countryNoResult}>
                                  No result
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        inputMode="tel"
                        className={`${styles.input} ${styles.phoneInput}`}
                        value={field.value}
                        placeholder={field.placeholder}
                        readOnly={!editMode}
                        maxLength={selectedPhoneCountry.maxLength}
                        onChange={(e) => handleChange(index, e.target.value)}
                      />
                    </div>
                  ) : field.label === "Date of Birth" && editMode ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={styles.input} type="button">
                          {dob ? format(dob, "dd MMM yyyy") : "Select date"}
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
                    <input
                      type="text"
                      className={`${styles.input} ${
                        ["Full Name", "Display Name"].includes(field.label)
                          ? styles.nameInput
                          : ""
                      }`}
                      value={field.value}
                      placeholder={field.placeholder}
                      readOnly={!editMode}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  )}

                  {field.isDropdown && editMode && field.isOpen && (
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
                            onClick={() => selectOption(index, getOptionLabel(option))}
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
                {validationErrors[field.label] && (
                  <p className={styles.errorText}>
                    {validationErrors[field.label]}
                  </p>
                )}
              </div>
            ))}
            {isCorporate && (
              <>
                <div className={styles.fieldWrapper}>
                  <div className={styles.fieldHeader}>
                    <label className={styles.label}>
                      Hotel Budget for Each Booking
                    </label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.input}
                      value={corporateFields.hotelBudget}
                      placeholder="Enter hotel budget"
                      onChange={(e) =>
                        handleCorporateChange("hotelBudget", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className={styles.fieldWrapper}>
                  <div className={styles.fieldHeader}>
                    <label className={styles.label}>
                      Flight Budget for Each Booking
                    </label>
                  </div>
                  <div className={styles.inputContainer}>
                    {" "}
                    <input
                      type="text"
                      className={styles.input}
                      value={corporateFields.flightBudget}
                      placeholder="Enter flight budget"
                      onChange={(e) =>
                        handleCorporateChange("flightBudget", e.target.value)
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          {editMode && (
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.goBackButton}
                onClick={handleProfileGoBack}
              >
                GO BACK
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleProfileSave}
              >
                SAVE
              </button>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.container} ${styles.containerMobile}`}>
        {activeMenu === "Personal Information" && (
          <>
            {" "}
            <header className={styles.header}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatarCircleC}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    hidden
                    onChange={handlePhotoSelect}
                  />

                  <div className={styles.avatarCircle}>
                    <Image
                      src={avatarPreview}
                      alt="Profile Avatar"
                      fill
                      className={styles.avatar}
                      sizes="102px"
                      onError={() => setAvatarPreview("/images/profilePlaceholder.avif")}
                    />
                  </div>
                  <div className={styles.cameraIconContaier}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.16622 2.33337C8.37668 2.33337 8.58323 2.3903 8.76397 2.49813C8.94471 2.60596 9.09292 2.76067 9.19289 2.94587L9.47639 3.47087C9.57636 3.65608 9.72456 3.81079 9.9053 3.91862C10.086 4.02645 10.2926 4.08338 10.5031 4.08337H11.668C11.9774 4.08337 12.2741 4.20629 12.4929 4.42508C12.7117 4.64388 12.8346 4.94062 12.8346 5.25004V10.5C12.8346 10.8095 12.7117 11.1062 12.4929 11.325C12.2741 11.5438 11.9774 11.6667 11.668 11.6667H2.33464C2.02522 11.6667 1.72847 11.5438 1.50968 11.325C1.29089 11.1062 1.16797 10.8095 1.16797 10.5V5.25004C1.16797 4.94062 1.29089 4.64388 1.50968 4.42508C1.72847 4.20629 2.02522 4.08337 2.33464 4.08337H3.49955C3.7098 4.08339 3.91614 4.02658 4.09676 3.91897C4.27738 3.81136 4.42556 3.65694 4.52564 3.47204L4.81089 2.94471C4.91096 2.75981 5.05914 2.60539 5.23976 2.49778C5.42038 2.39017 5.62672 2.33336 5.83697 2.33337H8.16622Z"
                        stroke="#000033"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7 9.33337C7.9665 9.33337 8.75 8.54987 8.75 7.58337C8.75 6.61688 7.9665 5.83337 7 5.83337C6.0335 5.83337 5.25 6.61688 5.25 7.58337C5.25 8.54987 6.0335 9.33337 7 9.33337Z"
                        stroke="#000033"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className={styles.titleGroup}>
                  <h1 className={styles.title}>
                    {profile?.full_name || "User Name"}
                  </h1>
                  <p className={styles.subtitle}>{user?.email || ""}</p>
                  <button
                    className={styles.changePhotoBtn}
                    onClick={() => setActiveMenu("editProfile")}
                    disabled={uploading}
                  >
                    <Pencil size={16} color="#000033" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </header>
            <div className={styles.grid}>
              {profileFields.map((field, index) => (
                <div key={index} className={styles.fieldWrapper}>
                  {/* Label row */}
                  <div className={styles.fieldHeader}>
                    <label className={styles.label}>{field.label}</label>

                    {field.isVerified && (
                      <span className={styles.verifiedBadge}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.56484 5.74669C2.46754 5.30838 2.48248 4.85259 2.60828 4.42158C2.73408 3.99058 2.96667 3.59832 3.28449 3.28117C3.6023 2.96402 3.99505 2.73225 4.42631 2.60735C4.85758 2.48245 5.3134 2.46847 5.75151 2.56669C5.99265 2.18956 6.32484 1.8792 6.71748 1.66421C7.11011 1.44923 7.55054 1.33655 7.99818 1.33655C8.44581 1.33655 8.88624 1.44923 9.27887 1.66421C9.67151 1.8792 10.0037 2.18956 10.2448 2.56669C10.6836 2.46804 11.1402 2.48196 11.5722 2.60717C12.0041 2.73237 12.3974 2.96478 12.7154 3.28279C13.0334 3.6008 13.2658 3.99407 13.391 4.42603C13.5162 4.85798 13.5302 5.31458 13.4315 5.75336C13.8086 5.9945 14.119 6.32669 14.334 6.71932C14.549 7.11196 14.6617 7.55239 14.6617 8.00002C14.6617 8.44766 14.549 8.88809 14.334 9.28072C14.119 9.67336 13.8086 10.0056 13.4315 10.2467C13.5297 10.6848 13.5157 11.1406 13.3908 11.5719C13.2659 12.0032 13.0342 12.3959 12.717 12.7137C12.3999 13.0315 12.0076 13.2641 11.5766 13.3899C11.1456 13.5157 10.6898 13.5307 10.2515 13.4334C10.0107 13.8119 9.67823 14.1236 9.28493 14.3396C8.89162 14.5555 8.45019 14.6687 8.00151 14.6687C7.55282 14.6687 7.11139 14.5555 6.71809 14.3396C6.32479 14.1236 5.99233 13.8119 5.75151 13.4334C5.3134 13.5316 4.85758 13.5176 4.42631 13.3927C3.99505 13.2678 3.6023 13.036 3.28449 12.7189C2.96667 12.4017 2.73408 12.0095 2.60828 11.5785C2.48248 11.1475 2.46754 10.6917 2.56484 10.2534C2.18481 10.0129 1.87178 9.68014 1.65487 9.28617C1.43796 8.8922 1.32422 8.44976 1.32422 8.00002C1.32422 7.55029 1.43796 7.10785 1.65487 6.71388C1.87178 6.31991 2.18481 5.9872 2.56484 5.74669Z"
                            stroke="white"
                            stroke-width="1.33333"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M6 7.99996L7.33333 9.33329L10 6.66663"
                            stroke="white"
                            stroke-width="1.33333"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Value row */}
                  <div className={styles.valueRow}>
                    {field.isDropdown && getFieldFlag(field) && (
                      <CountryFlagIcon
                        code={getFieldFlag(field)}
                        title={field.value}
                        className={styles.flagEmoji}
                      />
                    )}

                    <span
                      className={`${styles.value} ${
                        !field.value ? styles.mutedValue : ""
                      } `}
                    >
                      {field.value || "Not provided"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {activeMenu === "editProfile" && (
          <EditProfileMobile
            profileFields={profileFields}
            handleChange={handleChange}
            toggleDropdown={toggleDropdown}
            selectOption={selectOption}
            dropdownRef={dropdownRef}
            onSave={updateProfile}
          />
        )}
      </section>
    </>
  );
};

export default ProfileSection;
