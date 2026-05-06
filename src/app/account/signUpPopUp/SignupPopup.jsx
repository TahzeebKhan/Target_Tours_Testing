"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./SignupPopup.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { toast } from "react-toastify";
import BrandLogo from "@/shared/components/BrandLogo";
import { Eye, EyeOff } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function SignupPopup({ onNavigate, onClose }) {
  const OTP_RESEND_SECONDS = 30;
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isPhoneValid = (value) => /^[6-9]\d{9}$/.test(value); // Indian 10-digit phone

  const validateEmailOrPhone = () => {
    if (!email.trim()) {
      setEmailError("Email or phone number is required");
      return false;
    }

    const isNumeric = /^\d+$/.test(email);

    if (isNumeric) {
      if (!isPhoneValid(email)) {
        setEmailError("Enter a valid 10-digit phone number");
        return false;
      }
    } else if (!isEmailValid(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    // 🔹 Email / Phone validation
    if (!validateEmailOrPhone()) {
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }

    // 🔹 Confirm password validation
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
          body: JSON.stringify({
            email: email,
            password: password,
            domain: process.env.NEXT_PUBLIC_DOMAIN, // ❗ as required
          }),
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
    } catch (err) {
      setError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMessage("");
    setEmailError("");
    setOtpError("");

    let hasError = false;

    if (!validateEmailOrPhone()) {
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
            email: email,
            otp: otp.trim(),
            password: password,
            domain: process.env.NEXT_PUBLIC_DOMAIN,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "OTP verification failed");
      }

      setSuccessMessage(data?.message || "OTP verified successfully.");
      toast.success(data?.message || "Successfully registered.");
      onNavigate("login");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setEmailError("");
    setOtpError("");

    if (!validateEmailOrPhone()) {
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
          body: JSON.stringify({
            email: email,
            password: password,
            domain: process.env.NEXT_PUBLIC_DOMAIN,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "Unable to resend OTP");
      }

      setOtp("");
      setResendCountdown(OTP_RESEND_SECONDS);
      setSuccessMessage(data?.message || "OTP resent successfully.");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setResendLoading(false);
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
                  Enter Email Id/ Phone Number
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${
                    emailError ? styles.error : ""
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOtpSent(false);
                    setOtp("");
                    setOtpError("");
                    setSuccessMessage("");
                  }}
                />
                {emailError && (
                  <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>
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

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm password</label>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.passwordInput} ${
                      confirmPasswordError ? styles.error : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={!email.trim() || otpVerifyLoading}
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
              <button className={styles.socialButton}>
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google"
                  width={24}
                  height={24}
                />
                Sign in with Google
              </button>

              <button className={styles.socialButtonFacebook}>
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
