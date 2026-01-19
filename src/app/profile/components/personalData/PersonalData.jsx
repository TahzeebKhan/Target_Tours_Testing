"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./PersonalData.module.css";

import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

export const SetPasswordModal = ({ open, onClose }) => {
  useLockBodyScroll(open);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);
  if (!open) return null;
  const validate = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("SET PASSWORD CLICKED");
    if (!validate()) {
      console.log("VALIDATION FAILED", errors);
      return;
    }

    const token = Cookies.get("auth_token");
    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/update-password`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Password updated successfully");
      onClose();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update password";

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.overlayContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.overlayHeader}>
          <h2 className={styles.overlayTitle}>Set password</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <Image src="/icons/Close.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.overlayBody}>
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>New password</label>
            <input
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ""
                }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Confirm password</label>
            <input
              type="password"
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""
                }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className={styles.errorText}>{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.overlayFooter}>
          <button className={styles.backBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.sendBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "UPDATING..." : "SET PASSWORD"}
          </button>
        </div>
      </div>
    </div>
  );
};
export const DeleteAccountModal = ({ open, onClose, onConfirm }) => {
  useLockBodyScroll(open);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleDelete = () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setError("");
    onConfirm(password);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.overlayContent} ${styles.deleteContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.successBody}>
          <h2 className={styles.deleteTitle}>Delete account?</h2>

          <p className={styles.deleteDescription}>
            This action is permanent and cannot be undone.
          </p>

          {/* PASSWORD INPUT */}
          <div className={styles.formGroup} style={{ marginTop: "24px" }}>
            <label className={styles.fieldLabel}>Enter your password</label>
            <input
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="Enter password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          {/* ACTIONS */}
          <div className={styles.deleteActions}>
            <button className={styles.backBtn} onClick={onClose}>
              Cancel
            </button>

            <button className={styles.deleteBtn} onClick={handleDelete}>
              DELETE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PersonalData() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState("₹ Indian Rupee");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (US)",
    flag: "/images/us.svg",
  });

  const [isRecommendationsActive, setIsRecommendationsActive] = useState(true);

  const dropdownRef = useRef(null);
  const languageRef = useRef(null);

  const currencies = [
    "₹ Indian Rupee",
    // "$ U.S. dollar",
    // "£ Pound sterling",
    // "CNY Chinese yuan",
    // "SAR Saudi Arabian riyal",
    // "RUB Russian ruble",
    // "DKK Danish krone",
    // "AZN Azerbaijan, New Manats",
    // "TWD New Taiwan dollar",
  ];

  const languages = [
    { label: "English (US)", flag: "/images/us.svg" },
    // { label: "Deutsch", flag: "/icons/de.svg" },
    // { label: "Nederlands", flag: "/icons/bq.svg" },
    // { label: "Français", flag: "/icons/mf.svg" },
    // { label: "Español", flag: "/icons/es.svg" },
    // { label: "Español (AR)", flag: "/icons/ar.svg" },
    // { label: "Español (MX)", flag: "/icons/mx.svg" },
    // { label: "Italiano", flag: "/icons/it.svg" },
    // { label: "Hindi", flag: "/icons/india.svg" },
  ];

  const updateProfile = async (payload) => {
    const token = Cookies.get("auth_token");

    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/update-profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update profile";

      toast.error(msg);
    }
  };
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCurrencyOpen(false);
      }

      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRecommendations = () => {
    setIsRecommendationsActive((prev) => {
      const newValue = !prev;

      updateProfile({
        personalized_recommendation: newValue,
      });

      return newValue;
    });
  };

  const handleDeleteAccount = async (password) => {
    const token = Cookies.get("auth_token");

    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/delete-account`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ show backend success message if present
      toast.success(res?.data?.message || "Account deleted successfully");

      setIsDeleteOpen(false);

      // OPTIONAL
      // Cookies.remove("auth_token");
      // window.location.href = "/";
    } catch (error) {
      // ✅ ONLY backend message
      const backendMsg =
        error?.response?.data?.message || error?.response?.data?.error;

      if (backendMsg) {
        toast.error(backendMsg);
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Customization Section */}
      <section className={styles.section}>
        <h2 className={styles.mainHeading}>Customization preferences</h2>
        <div className={styles.divider} />

        <div className={styles.settingsWrapper}>
          {/* Currency */}
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>CURRENCY</h3>
              <p className={styles.description}>
                Select your desired currency for transactions and price display,
                simplifying international use.
              </p>
            </div>

            <div className={styles.control}>
              <div className={styles.dropdownWrapper} ref={dropdownRef}>
                <div
                  className={`${styles.dropdown} ${styles.currencyDropdown}`}
                  onClick={() => setIsCurrencyOpen((prev) => !prev)}
                >
                  <span>{selectedCurrency}</span>
                  <Image
                    src="/images/chevron-down-2.svg"
                    alt="Arrow"
                    width={12}
                    height={12}
                    className={styles.arrow}
                  />
                </div>

                {isCurrencyOpen && (
                  <div className={styles.dropdownMenu}>
                    {currencies.map((currency) => {
                      const isSelected = currency === selectedCurrency;

                      return (
                        <div
                          key={currency}
                          className={`${styles.dropdownItem} ${isSelected ? styles.selectedItem : ""
                            }`}
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setIsCurrencyOpen(false);
                          }}
                        >
                          <span>{currency}</span>

                          {isSelected && (
                            <Image
                              src="/icons/check.svg"
                              alt="Selected"
                              width={20}
                              height={20}
                              className={styles.checkIcon}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Language */}
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>LANGUAGE</h3>
              <p className={styles.description}>
                Choose your preferred language for app display, enhancing your
                user experience.
              </p>
            </div>

            <div className={styles.control}>
              <div className={styles.dropdownWrapper} ref={languageRef}>
                <div
                  className={`${styles.dropdown} ${styles.languageDropdown}`}
                  onClick={() => setIsLanguageOpen((prev) => !prev)}
                >
                  <div className={styles.flagWrapper}>
                    <Image
                      src={selectedLanguage.flag}
                      alt={selectedLanguage.label}
                      width={20}
                      height={14}
                    />
                    <span>{selectedLanguage.label}</span>
                  </div>

                  <Image
                    src="/images/chevron-down-2.svg"
                    alt="Arrow"
                    width={12}
                    height={12}
                    className={styles.arrow}
                  />
                </div>

                {isLanguageOpen && (
                  <div className={styles.dropdownMenu}>
                    {languages.map((lang) => {
                      const isSelected = lang.label === selectedLanguage.label;

                      return (
                        <div
                          key={lang.label}
                          className={`${styles.dropdownItem} ${isSelected ? styles.selectedItem : ""
                            }`}
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setIsLanguageOpen(false);

                            updateProfile({
                              language: lang.label.toLowerCase(), // "english", "hindi", etc.
                            });
                          }}
                        >
                          <div className={styles.flagWrapper}>
                            <Image
                              src={lang.flag}
                              alt={lang.label}
                              width={20}
                              height={14}
                            />
                            <span>{lang.label}</span>
                          </div>

                          {isSelected && (
                            <Image
                              src="/icons/check.svg"
                              alt="Selected"
                              width={20}
                              height={20}
                              className={styles.checkIcon}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>
                PERSONALIZED RECOMMENDATIONS
              </h3>
              <p className={styles.description}>
                We personalize recommendations based on your activity. You can
                opt out anytime.
              </p>
            </div>

            <div className={styles.control}>
              <button
                className={`${styles.toggle} ${isRecommendationsActive ? styles.toggleActive : ""
                  }`}
                onClick={toggleRecommendations}
                aria-pressed={isRecommendationsActive}
              >
                <div className={styles.toggleCircle} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.section}>
        <h2 className={styles.mainHeading}>Security</h2>
        <div className={styles.divider} />

        <div className={styles.settingsWrapper}>
          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>PASSWORD</h3>
              <p className={styles.description}>
                Easily update your password in settings to maintain account
                security and ensure privacy.
              </p>
            </div>

            <div className={styles.control}>
              <button
                className={styles.outlineButton}
                onClick={() => setIsSetPasswordOpen(true)}
              >
                SET PASSWORD
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.textContent}>
              <h3 className={styles.subHeading}>REMOVE ACCOUNT</h3>
              <p className={styles.description}>
                Delete your account through settings for complete removal of
                your data from the system.
              </p>
            </div>

            <div className={styles.control}>
              <button
                className={styles.deleteButton}
                onClick={() => setIsDeleteOpen(true)}
              >
                DELETE ACCOUNT
              </button>
            </div>
          </div>
        </div>
      </section>
      <DeleteAccountModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      <SetPasswordModal
        open={isSetPasswordOpen}
        onClose={() => setIsSetPasswordOpen(false)}
      />
    </div>
  );
}
