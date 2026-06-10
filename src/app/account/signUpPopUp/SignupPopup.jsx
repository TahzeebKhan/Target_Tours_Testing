"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./SignupPopup.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import BrandLogo from "@/shared/components/BrandLogo";
import { appToast } from "@/shared/components/appToast/AppToast";
import { startGoogleLogin } from "@/shared/services/googleAuth";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import {
  CountryFlagIcon,
  NationalityList,
  nationalityAliasToIso,
} from "@/app/profile/components/profileSection/CountryName";

import "swiper/css";
import "swiper/css/pagination";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const countryCodes = Array.from(
  new Set(
    Object.values(nationalityAliasToIso).filter((code) =>
      /^[A-Z]{2}$/.test(code),
    ),
  ),
).sort();

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

const COUNTRY_OPTIONS = [
  "IN",
  ...countryCodes.filter((code) => code !== "IN"),
].map((code) => ({
  code,
  name: countryNameByCode[code] || code,
  searchText: `${code} ${countryNameByCode[code] || ""} ${
    countryAliasSearchByCode[code] || ""
  }`.toLowerCase(),
  maxLength: code === "IN" || code === "US" ? 10 : 15,
}));

export default function SignupPopup({ onNavigate, onClose }) {
  const OTP_RESEND_SECONDS = 30;
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("IN");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const { login } = useAuth();
  const countryDropdownRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    setIsPortalReady(true);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!otpSent || resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpSent, resendCountdown]);

  useEffect(() => {
    if (!isCountryDropdownOpen) return;

    const handlePointerDown = (event) => {
      if (!countryDropdownRef.current?.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isCountryDropdownOpen]);

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const selectedCountry =
    COUNTRY_OPTIONS.find((option) => option.code === country) ||
    COUNTRY_OPTIONS[0];
  const filteredCountryOptions = countrySearch.trim()
    ? COUNTRY_OPTIONS.filter((option) =>
        option.searchText.includes(countrySearch.trim().toLowerCase()),
      )
    : COUNTRY_OPTIONS;

  const isPhoneValid = (value) => {
    if (country === "IN") {
      return /^[6-9]\d{9}$/.test(value);
    }

    return /^\d{6,15}$/.test(value);
  };

  const isPasswordValid = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  const getRegisterPayload = () => ({
    email: email.trim(),
    phone_number: phoneNumber.trim(),
    password,
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    country,
    name: fullName.trim(),
  });

  const resetOtpState = () => {
    setOtpSent(false);
    setOtp("");
    setOtpError("");
    setSuccessMessage("");
  };

  const validateSignupFields = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!isEmailValid(email.trim())) {
      setEmailError("Enter a valid email address");
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      setPhoneNumberError("Mobile number is required");
      isValid = false;
    } else if (!isPhoneValid(phoneNumber.trim())) {
      setPhoneNumberError("Enter a valid mobile number");
      isValid = false;
    }

    if (!fullName.trim()) {
      setFullNameError("Full name is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setEmailError("");
    setPhoneNumberError("");
    setFullNameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!validateSignupFields()) {
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (!isPasswordValid(password)) {
      setPasswordError(
        "Password must be at least 8 characters and include uppercase, lowercase, and special character",
      );
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setRegisterLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getRegisterPayload()),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Signup failed");
      }

      setOtpSent(true);
      setOtp("");
      setResendCountdown(OTP_RESEND_SECONDS);
      setSuccessMessage(data?.message || "OTP sent successfully.");
      appToast.success(data?.message || "OTP sent successfully.");
    } catch (err) {
      setError(err.message);
      appToast.error(err.message || "Signup failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMessage("");
    setEmailError("");
    setPhoneNumberError("");
    setFullNameError("");
    setOtpError("");

    let hasError = false;

    if (!validateSignupFields()) {
      hasError = true;
    }

    if (!otp.trim()) {
      setOtpError("OTP is required");
      hasError = true;
    } else if (!/^\d{4,6}$/.test(otp.trim())) {
      setOtpError("Enter a valid OTP");
      hasError = true;
    }

    if (hasError) return;

    try {
      setOtpVerifyLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
            phone_number: phoneNumber.trim(),
            password,
            domain: process.env.NEXT_PUBLIC_DOMAIN,
            country,
            name: fullName.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "OTP verification failed");
      }

      setSuccessMessage(data?.message || "OTP verified successfully.");
      appToast.success("Welcome! You've Registered Successfully");
      onNavigate("login");
    } catch (err) {
      setOtpError(err.message);
      appToast.error(err.message || "OTP verification failed");
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setEmailError("");
    setPhoneNumberError("");
    setFullNameError("");
    setOtpError("");

    if (!validateSignupFields()) {
      return;
    }

    try {
      setResendLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getRegisterPayload()),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "Unable to resend OTP");
      }

      setOtp("");
      setResendCountdown(OTP_RESEND_SECONDS);
      setSuccessMessage(data?.message || "OTP resent successfully.");
      appToast.success(data?.message || "OTP resent successfully.");
    } catch (err) {
      setOtpError(err.message);
      appToast.error(err.message || "Unable to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMessage("");

    try {
      setGoogleLoginLoading(true);
      const data = await startGoogleLogin();

      login({
        token: data.token,
        user: data.user,
      });

      appToast.success("Welcome! You've Logged in Successfully");
      onClose();
    } catch (err) {
      setError(err.message || "Google login failed");
      appToast.error(err.message || "Google login failed");
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const slides = Array.from({ length: 5 }); // 5 slides (change count if needed)
  const signupModal = (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.mainContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section */}
        <section className={styles.imageSection}>
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            className={styles.logoSwiper}
          >
            {slides.map((_, index) => (
              <SwiperSlide key={index} className={styles.logoSlide}>
                <Image
                  src="/images/signup-hero.webp"
                  alt="Target Tours Logo"
                  width={87}
                  priority
                  unoptimized
                  height={73}
                  className={styles.slideImage}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {/* <Image
            src="/images/signup-hero.webp"
            alt="Scenic mountain view"
            fill
            className={styles.heroImage}
            priority
          /> */}
        </section>

        {/* Right Section */}
        <section className={styles.formSection}>
          <div className={styles.formContent}>
            <header className={styles.header}>
              <div className={styles.logoContainer}>
                <BrandLogo
                  fallbackSrc="/images/tour-logo.svg"
                  alt="Target Tours Logo"
                  width={87}
                  height={73}
                  className={styles.logo}
                />
              </div>

              <div className={styles.titleWrapper}>
                <h1 className={styles.title}>Create new account</h1>
                <p className={styles.subtitle}>
                  Already a member?{" "}
                  <span
                    className={styles.linkText}
                    onClick={() => onNavigate("login")}
                  >
                    Log in
                  </span>
                </p>
              </div>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Enter Email
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${
                    emailError ? styles.error : ""
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    resetOtpState();
                  }}
                />
                {emailError && (
                  <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>
                )}
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Mobile Number</label>
                <div
                  className={`${styles.phoneInputWrap} ${
                    phoneNumberError ? styles.error : ""
                  }`}
                >
                  <div
                    className={styles.countryDropdown}
                    ref={countryDropdownRef}
                  >
                    <button
                      type="button"
                      className={styles.countryTrigger}
                      aria-expanded={isCountryDropdownOpen}
                      aria-label="Select country code"
                      onClick={() => {
                        setIsCountryDropdownOpen((current) => !current);
                        setCountrySearch("");
                      }}
                    >
                      <CountryFlagIcon
                        code={country}
                        title={country}
                        className={styles.countryFlag}
                      />
                      <span>{country}</span>
                    </button>

                    {isCountryDropdownOpen && (
                      <div className={styles.countryMenu}>
                        <input
                          type="text"
                          className={styles.countrySearch}
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country"
                          aria-label="Search country"
                        />

                        <div className={styles.countryOptionsList}>
                          {filteredCountryOptions.length > 0 ? (
                            filteredCountryOptions.map((option) => (
                              <button
                                key={option.code}
                                type="button"
                                title={option.name}
                                className={`${styles.countryOption} ${
                                  option.code === country
                                    ? styles.countryOptionActive
                                    : ""
                                }`}
                                onClick={() => {
                                  setCountry(option.code);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearch("");
                                  setPhoneNumber((current) =>
                                    current
                                      .replace(/[^\d]/g, "")
                                      .slice(0, option.maxLength),
                                  );
                                  setPhoneNumberError("");
                                  resetOtpState();
                                }}
                              >
                                <CountryFlagIcon
                                  code={option.code}
                                  title={option.code}
                                  className={styles.countryFlag}
                                />
                                <span>{option.code}</span>
                              </button>
                            ))
                          ) : (
                            <p className={styles.countryNoResult}>No result</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="tel"
                    className={`${styles.input} ${styles.phoneInput}`}
                    value={phoneNumber}
                    maxLength={selectedCountry.maxLength}
                    onChange={(e) => {
                      setPhoneNumber(
                        e.target.value
                          .replace(/[^\d]/g, "")
                          .slice(0, selectedCountry.maxLength),
                      );
                      setPhoneNumberError("");
                      resetOtpState();
                    }}
                  />
                </div>
                {phoneNumberError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {phoneNumberError}
                  </p>
                )}
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  className={`${styles.input} ${
                    fullNameError ? styles.error : ""
                  }`}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFullNameError("");
                    resetOtpState();
                  }}
                />
                {fullNameError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {fullNameError}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter password</label>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.passwordInput} ${
                      passwordError ? styles.error : ""
                    }`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                      resetOtpState();
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passwordError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {passwordError}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm password</label>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.passwordInput} ${
                      confirmPasswordError ? styles.error : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordError("");
                      resetOtpState();
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {confirmPasswordError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {error && (
                <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
              )}

              {successMessage && (
                <p className={styles.successText}>{successMessage}</p>
              )}

              {otpSent && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>OTP verification</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    className={`${styles.input} ${
                      otpError ? styles.error : ""
                    }`}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
                    }
                  />
                  <div className={styles.otpMetaRow}>
                    <button
                      type="button"
                      className={styles.resendOtpButton}
                      disabled={resendCountdown > 0 || resendLoading}
                      onClick={handleResendOtp}
                    >
                      {resendLoading
                        ? "Sending..."
                        : resendCountdown > 0
                          ? `Resend OTP in ${resendCountdown}s`
                          : "Resend OTP"}
                    </button>
                  </div>
                  {otpError && (
                    <p style={{ color: "red", fontSize: "12px" }}>{otpError}</p>
                  )}
                </div>
              )}

              <div className={styles.formOptions}>
                <label className={styles.checkboxContainer}>
                  <input type="checkbox" className={styles.checkboxInput} />
                  <span className={styles.customCheckbox}></span>
                  <span className={styles.checkboxLabel}>
                    Keep me signed in
                  </span>
                </label>
              </div>

              {otpSent ? (
                <button
                  type="button"
                  className={styles.signupButton}
                  disabled={
                    !email.trim() ||
                    !phoneNumber.trim() ||
                    !fullName.trim() ||
                    otpVerifyLoading
                  }
                  onClick={handleVerifyOtp}
                >
                  {otpVerifyLoading ? "VERIFYING..." : "VERIFY OTP"}
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.signupButton}
                  disabled={registerLoading}
                >
                  {registerLoading ? "SENDING OTP..." : "SIGN UP"}
                </button>
              )}
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerText}>Or sign in with</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.socialButton}
                disabled={googleLoginLoading}
                onClick={handleGoogleLogin}
              >
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google"
                  width={24}
                  height={24}
                />
                {googleLoginLoading ? "Connecting..." : "Sign in with Google"}
              </button>

              <button type="button" className={styles.socialButtonFacebook}>
                <Image
                  src="/icons/facebook-icon.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                />
                Sign in with Facebook
              </button>
            </div>

            <footer className={styles.footer}>
              <p className={styles.copyright}>
                Copyrights ©2023 Target tours. Build by Webninjaz.
              </p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );

  if (!isPortalReady) return null;

  return createPortal(signupModal, document.body);
}
