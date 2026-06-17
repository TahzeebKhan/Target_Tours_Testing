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
import {
  CountryCodes,
  CountryFlagIcon,
} from "@/app/profile/components/profileSection/CountryName";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const SIGNUP_OTP_LENGTH = 6;

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
    searchText: `${country.code} ${country.name || ""} ${
      country.dial_code || ""
    }`.toLowerCase(),
    maxLength: country.code === "IN" || country.code === "US" ? 10 : 15,
  }));

export default function SignupPopup({ onNavigate, onClose }) {
  useLockBodyScroll(true);

  const OTP_RESEND_SECONDS = 30;
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("IN");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpDigits, setOtpDigits] = useState(() =>
    Array(SIGNUP_OTP_LENGTH).fill(""),
  );
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
  const { login } = useAuth();
  const countryDropdownRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    setIsPortalReady(true);
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

  const getRegisterPayload = () => ({
    email: email.trim(),
    phone_number: phoneNumber.trim(),
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    country,
    name: fullName.trim(),
  });

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpDigits(Array(SIGNUP_OTP_LENGTH).fill(""));
    setOtpError("");
    setSuccessMessage("");
  };

  const clearValidationErrors = () => {
    setEmailError("");
    setPhoneNumberError("");
    setFullNameError("");
    setOtpError("");
  };

  const validateSignupFields = () => {
    if (!fullName.trim()) {
      setFullNameError("Full name is required");
      return false;
    }

    if (!phoneNumber.trim()) {
      setPhoneNumberError("Mobile number is required");
      return false;
    } else if (!isPhoneValid(phoneNumber.trim())) {
      setPhoneNumberError("Enter a valid mobile number");
      return false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!isEmailValid(email.trim())) {
      setEmailError("Enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    clearValidationErrors();

    if (!validateSignupFields()) {
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
      setOtpDigits(Array(SIGNUP_OTP_LENGTH).fill(""));
      setResendCountdown(OTP_RESEND_SECONDS);
      setSuccessMessage(data?.message || "OTP sent successfully.");
      appToast.success(data?.message || "OTP sent successfully.");
    } catch (err) {
      setError(err.message);
      // appToast.error(err.message || "Signup failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMessage("");
    clearValidationErrors();

    if (!validateSignupFields()) {
      return;
    }

    const otpValue = otpDigits.join("");

    if (!otpValue.trim()) {
      setOtpError("OTP is required");
      return;
    } else if (otpValue.length !== SIGNUP_OTP_LENGTH) {
      setOtpError("Enter a valid OTP");
      return;
    }

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
            otp: otpValue,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message || data?.message || "OTP verification failed",
        );
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
    clearValidationErrors();

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

      setOtpDigits(Array(SIGNUP_OTP_LENGTH).fill(""));
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

  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/[^\d]/g, "").slice(-1);
    const nextOtp = [...otpDigits];
    nextOtp[index] = digit;
    setOtpDigits(nextOtp);
    setOtpError("");

    if (digit) {
      const nextInput = document.getElementById(`signup-otp-${index + 1}`);
      nextInput?.focus();
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
        profile: data.userProfile,
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
                  src="/images/travel-hero.webp"
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
            {otpSent ? (
              <div className={styles.otpContent}>
                <BrandLogo
                  fallbackSrc="/images/tour-logo.svg"
                  alt="Target Tours Logo"
                  width={87}
                  height={73}
                  className={styles.logo}
                />

                <div className={styles.otpTitleWrapper}>
                  <h1 className={styles.title}>Almost there!</h1>
                  <p className={styles.subtitle}>
                    Enter the OTP sent to your number
                  </p>
                </div>

                <form className={styles.otpForm} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.otpInputs}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={`signup-otp-${index}`}
                        id={`signup-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={styles.otpInput}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p style={{ color: "red", fontSize: "12px" }}>{otpError}</p>
                  )}
                  {error && (
                    <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
                  )}
                </form>

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
                  {otpVerifyLoading ? "CREATING..." : "CREATE ACCOUNT"}
                </button>

                <div className={styles.otpResend}>
                  <p>
                    Haven't received the code?{" "}
                    <button
                      type="button"
                      className={styles.linkButton}
                      disabled={resendCountdown > 0 || resendLoading}
                      onClick={handleResendOtp}
                    >
                      {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  </p>
                  <span>
                    {resendCountdown > 0
                      ? `Resend in 0:${String(resendCountdown).padStart(2, "0")}`
                      : "Resend now"}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.backToSignup}
                  onClick={() => {
                    setOtpSent(false);
                    setOtpDigits(Array(SIGNUP_OTP_LENGTH).fill(""));
                    setOtpError("");
                  }}
                >
                  ← Back to Signup
                </button>
              </div>
            ) : (
              <>
                {/* <button
                  type="button"
                  className={styles.backToLogin}
                  onClick={() => onNavigate("login")}
                >
                  ← Back to Login
                </button> */}

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
                    <h1 className={styles.title}>Create your account</h1>
                    <p className={styles.subtitle}>
                      Already have an account?{" "}
                      <span
                        className={styles.linkText}
                        onClick={() => onNavigate("login")}
                      >
                        Log In
                      </span>
                    </p>
                  </div>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      placeholder="Olivia Rhye"
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
                    <label className={styles.label}>Phone Number</label>
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
                          <span>{selectedCountry.dialCode}</span>
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
                        type="tel"
                        inputMode="numeric"
                        placeholder="(555) 000-0000"
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
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      inputMode="email"
                      placeholder="olivia@example.com"
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
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {emailError}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
                  )}

                <button
                  type="submit"
                  className={styles.signupButton}
                  disabled={registerLoading}
                >
                    {registerLoading ? "SENDING OTP..." : "SEND OTP TO VERIFY"}
                </button>
                </form>

                <div className={styles.policyParent}>
                                  By proceeding, you agree to{" "}
                                  <Link href="/" className={styles.Policy}>Privacy Policy</Link>,{" "}
                                  <Link href="/" className={styles.Policy}>User Agreement</Link>{" "}
                                  and <Link href="/" className={styles.Policy}>T&amp;C</Link>
                                </div>

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

                  <button type="button" className={styles.socialButtonApple}>
                    <Image
                      src="/images/AppleIcon.svg"
                      alt="Facebook"
                      width={24}
                      height={24}
                    />
                    Sign in with Apple
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  if (!isPortalReady) return null;

  return createPortal(signupModal, document.body);
}
