
"use client";
import Image from "next/image";
import styles from "./LoginPopup.module.css";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/app/context/AuthContext";
import { appToast } from "@/shared/components/appToast/AppToast";
import BrandLogo from "@/shared/components/BrandLogo";
import { startGoogleLogin } from "@/shared/services/googleAuth";
import { Eye, EyeOff } from "lucide-react";
import {
  CountryCodes,
  CountryFlagIcon,
} from "@/app/profile/components/profileSection/CountryName";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const OTP_LENGTH = 6;

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

export default function LoginPopup({ onNavigate, onClose }) {
  useLockBodyScroll(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const slides = Array.from({ length: 5 }); // 5 slides (change count if needed)
  const [corporateLogin, setCorporateLogin] = useState(false);
  const [loginMode, setLoginMode] = useState("phone");
  const [authStep, setAuthStep] = useState("login");
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [isPhoneCountryDropdownOpen, setIsPhoneCountryDropdownOpen] =
    useState(false);
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

  const { login } = useAuth();

  useIsomorphicLayoutEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        phoneCountryDropdownRef.current &&
        !phoneCountryDropdownRef.current.contains(event.target)
      ) {
        setIsPhoneCountryDropdownOpen(false);
        setPhoneCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isPhoneValid = (value) => {
    if (phoneCountry === "IN") return /^[6-9]\d{9}$/.test(value);
    return /^\d{6,15}$/.test(value);
  };

  const getLoginPayload = (includeCountry = true) => {
    const payload = {
      domain: process.env.NEXT_PUBLIC_DOMAIN,
    };

    if (loginMode === "phone") {
      payload.phone_number = email.trim();
      if (includeCountry) payload.country = phoneCountry;
    } else {
      payload.email = email.trim();
    }

    return payload;
  };

  const saveVerifiedLogin = async (data) => {
    const authData = data?.data || data || {};
    const token = authData.token;
    const user = authData.user;
    const profile = authData.userProfile || authData.profile;

    if (!token || !user) return;

    login({
      token,
      user,
      profile,
    });

    try {
      const profileRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (profileRes?.data) {
        const authExpiresAt = Number(Cookies.get("auth_expires_at"));
        Cookies.set("user_profile", JSON.stringify(profileRes.data), {
          expires: Number.isFinite(authExpiresAt) ? new Date(authExpiresAt) : 1,
        });
      }
    } catch (profileErr) {
      console.log("Profile fetch failed (non-blocking)");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setOtpError("");

    if (!email.trim()) {
      setEmailError(
        loginMode === "phone" ? "Phone number is required" : "Email is required",
      );
      return;
    }

    if (loginMode === "phone" && !isPhoneValid(email)) {
      setEmailError("Enter a valid phone number");
      return;
    }

    if (loginMode === "email" && !isEmailValid(email)) {
      setEmailError("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getLoginPayload()),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "Login failed");
      }

      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setAuthStep("otp");
      appToast.success(data?.message || "OTP sent successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong");
      appToast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^\d]/g, "").slice(-1);
    const nextOtp = [...otpDigits];
    nextOtp[index] = digit;
    setOtpDigits(nextOtp);
    setOtpError("");

    if (digit) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;

    event.preventDefault();
    setOtpError("");

    const nextOtp = [...otpDigits];

    if (nextOtp[index]) {
      nextOtp[index] = "";
      setOtpDigits(nextOtp);
      return;
    }

    if (index > 0) {
      nextOtp[index - 1] = "";
      setOtpDigits(nextOtp);
      const previousInput = document.getElementById(`login-otp-${index - 1}`);
      previousInput?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otpDigits.join("");
    setOtpError("");
    setError("");

    if (otpValue.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    try {
      setOtpVerifyLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/verify-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...getLoginPayload(false),
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

      await saveVerifiedLogin(data);
      appToast.success(data?.message || "Welcome! You've Logged in Successfully");
      onClose();
    } catch (err) {
      setOtpError(err.message || "OTP verification failed");
      appToast.error(err.message || "OTP verification failed");
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError(
        loginMode === "phone" ? "Phone number is required" : "Email is required",
      );
      hasError = true;
    } else if (loginMode === "phone") {
      if (!isPhoneValid(email)) {
        setEmailError("Enter a valid 10-digit phone number");
        hasError = true;
      }
    } else if (!isEmailValid(email)) {
      setEmailError("Enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }
    if (hasError) return;

    try {
      setLoading(true);

      // 1️⃣ LOGIN API
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            domain: process.env.NEXT_PUBLIC_DOMAIN,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Login failed");
      }

      // 2️⃣ STORE AUTH DATA
      login({
        token: data.token,
        user: data.user,
        profile: data.userProfile,
      });

      // 3️⃣ FETCH USER PROFILE (IMPORTANT PART)
      try {
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/frontend-user-profiles/by-user/${data.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        if (profileRes?.data) {
          const authExpiresAt = Number(Cookies.get("auth_expires_at"));
          Cookies.set("user_profile", JSON.stringify(profileRes.data), {
            expires: Number.isFinite(authExpiresAt)
              ? new Date(authExpiresAt)
              : 1,
          });
        }
      } catch (profileErr) {
        console.log("Profile fetch failed (non-blocking)");
      }

      // 5️⃣ CLOSE POPUP
      appToast.success(data?.message || "Welcome! You've Logged in Successfully");
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
      appToast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

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

  const handleCreateAccountClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    setAuthStep("login");
    setCorporateLogin(false);
    setIsPhoneCountryDropdownOpen(false);
    onNavigate("signup");
  };

  const corporateLoginModal = (
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.mainContainer}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Section */}
          <section className={styles.imageSection}>
            {/* <Image
            src="/images/travel-hero.webp"
            alt="Scenic view of Ko Tapu"
            fill
            className={styles.heroImage}
            priority
          /> */}

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
                  <h1 className={styles.title}>Welcome back</h1>
                  {/* <p className={styles.subtitle}>
                    New here?{" "}
                    <span
                      className={styles.linkText}
                      onClick={() => onNavigate("signup")}
                    >
                      Create an account
                    </span>
                  </p>
                  <p className={styles.subtitle}>
                    Corporate Employee?{" "}
                    <span
                      className={styles.linkText}
                      onClick={() => setCorporateLogin(true)}
                    >
                      Sign In Here
                    </span>
                  </p> */}
                </div>
              </header>

              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="adfet465"
                    className={`${styles.input} ${
                      emailError ? styles.error : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // required
                  />

                  {emailError && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {emailError}
                    </p>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.passwordInputWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${styles.input} ${styles.passwordInput} ${
                        passwordError ? styles.error : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {error && (
                  <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
                )}

                <div className={styles.formOptions}>
                  <label className={styles.checkboxContainer}>
                    <input type="checkbox" className={styles.checkboxInput} />
                    <span className={styles.customCheckbox}></span>
                    <span className={styles.checkboxLabel}>Remember me?</span>
                  </label>
                  <span className={styles.forgotPassword}>
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>

              {/* <div className={styles.divider}>
                <span className={styles.dividerText}>Or sign in with</span>
              </div>

              <div className={styles.socialButtons}>
                <button className={styles.socialButton}>
                  <Image
                    src="/icons/google-icon.svg"
                    alt="Google"
                    width={24}
                    height={24}
                  />
                  SIGN IN WITH GOOGLE
                </button>

                <button className={styles.socialButtonFacebook}>
                  <Image
                    src="/icons/facebook-icon.svg"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                  SIGN IN WITH FACEBOOK
                </button>
              </div> */}

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

  const defaultLoginModal = (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.mainContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section */}
        <section className={styles.imageSection}>
          {/* <Image
            src="/images/travel-hero.webp"
            alt="Scenic view of Ko Tapu"
            fill
            className={styles.heroImage}
            priority
          /> */}

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
        </section>
        {/* Right Section */}
        <section className={styles.formSection}>
          <div className={styles.formContent}>
            {authStep === "otp" ? (
              <div className={styles.otpContent}>
                <BrandLogo
                  fallbackSrc="/images/tour-logo.svg"
                  alt="Target Tours Logo"
                  width={87}
                  height={73}
                  className={styles.logo}
                />
                <div className={styles.otpTitleGroup}>
                  <h1 className={styles.title}>Verify your number</h1>
                  <p className={styles.subtitle}>
                    We've sent a {OTP_LENGTH}-digit code to
                  </p>
                </div>

                <form className={styles.otpForm} onSubmit={handleVerifyOtp}>
                  <div className={styles.otpInputs}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={`login-otp-${index}`}
                        id={`login-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={styles.otpInput}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p style={{ color: "red", fontSize: "12px" }}>{otpError}</p>
                  )}
                  <button
                    type="submit"
                    className={styles.loginButton}
                    disabled={otpVerifyLoading}
                  >
                    {otpVerifyLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>

                <div className={styles.otpResend}>
                  <p>
                    Haven't received the code?{" "}
                    <button type="button" className={styles.linkButton}>
                      Resend OTP
                    </button>
                  </p>
                  <span>Resend in 0:45</span>
                </div>

                <button
                  type="button"
                  className={styles.backToLogin}
                  onClick={() => {
                    setAuthStep("login");
                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                    setOtpError("");
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              <>
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
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>
                      New here?{" "}
                      <button
                        type="button"
                        className={styles.linkText}
                        onClick={handleCreateAccountClick}
                      >
                        Create an account
                      </button>
                    </p>
                    <p className={styles.subtitle}>
                      Corporate Employee?{" "}
                      <span
                        className={styles.linkText}
                        onClick={() => setCorporateLogin(true)}
                      >
                        Sign In Here
                      </span>
                    </p>
                  </div>
                </header>

                <form className={styles.form} onSubmit={handleSendOtp}>
                  <div className={styles.inputGroup}>
                    <div className={styles.labelParent}>
                      <label className={styles.label}>
                        {loginMode === "phone" ? "Phone Number" : "Email Address"}
                      </label>

                      <div className={styles.loginModeToggle} role="tablist">
                        <button
                          type="button"
                          className={`${styles.loginModeButton} ${
                            loginMode === "phone"
                              ? styles.loginModeButtonActive
                              : ""
                          }`}
                          onClick={() => {
                            setLoginMode("phone");
                            setEmail("");
                            setEmailError("");
                            setIsPhoneCountryDropdownOpen(false);
                          }}
                          aria-selected={loginMode === "phone"}
                          role="tab"
                        >
                          Phone
                        </button>
                        <button
                          type="button"
                          className={`${styles.loginModeButton} ${
                            loginMode === "email"
                              ? styles.loginModeButtonActive
                              : ""
                          }`}
                          onClick={() => {
                            setLoginMode("email");
                            setEmail("");
                            setEmailError("");
                            setIsPhoneCountryDropdownOpen(false);
                          }}
                          aria-selected={loginMode === "email"}
                          role="tab"
                        >
                          Email
                        </button>
                      </div>
                    </div>
                    {loginMode === "phone" ? (
                      <div
                        className={`${styles.phoneInputWrap} ${
                          emailError ? styles.error : ""
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
                            onClick={() => {
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

                          {isPhoneCountryDropdownOpen && (
                            <div className={styles.countryMenu}>
                              <input
                                type="text"
                                className={styles.countrySearch}
                                value={phoneCountrySearch}
                                onChange={(e) =>
                                  setPhoneCountrySearch(e.target.value)
                                }
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
                                        setEmail((current) =>
                                          current
                                            .replace(/[^\d]/g, "")
                                            .slice(0, option.maxLength),
                                        );
                                        setEmailError("");
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
                                  <p className={styles.countryNoResult}>No result</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <input
                          type="tel"
                          inputMode="numeric"
                          className={`${styles.input} ${styles.phoneInput}`}
                          value={email}
                          placeholder="(555) 000-0000"
                          maxLength={selectedPhoneCountry.maxLength}
                          onChange={(e) => {
                            setEmail(
                              e.target.value
                                .replace(/[^\d]/g, "")
                                .slice(0, selectedPhoneCountry.maxLength),
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="email"
                        inputMode="email"
                        className={`${styles.input} ${
                          emailError ? styles.error : ""
                        }`}
                        value={email}
                        placeholder="you@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    )}

                    {emailError && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {emailError}
                      </p>
                    )}
                    {error && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={styles.loginButton}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
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
                    {googleLoginLoading
                      ? "CONNECTING..."
                      : "SIGN IN WITH GOOGLE"}
                  </button>

                  <button type="button" className={styles.socialButtonFacebook}>
                    <Image
                      src="/icons/facebook-icon.svg"
                      alt="Facebook"
                      width={24}
                      height={24}
                    />
                    SIGN IN WITH FACEBOOK
                  </button>
                </div>

                <footer className={styles.footer}>
                  <p className={styles.copyright}>
                    Copyrights ©2023 Target tours. Build by Webninjaz.
                  </p>
                </footer>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  if (!isPortalReady) return null;

  return createPortal(
    corporateLogin ? corporateLoginModal : defaultLoginModal,
    document.body
  );
}
