"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./SignupPopup.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function SignupPopup({ onNavigate, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isPhoneValid = (value) => /^[6-9]\d{9}$/.test(value); // Indian 10-digit phone

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    // 🔹 Email / Phone validation
    if (!email.trim()) {
      setEmailError("Email or phone number is required");
      hasError = true;
    } else {
      const isNumeric = /^\d+$/.test(email);

      if (isNumeric) {
        if (!isPhoneValid(email)) {
          setEmailError("Enter a valid 10-digit phone number");
          hasError = true;
        }
      } else {
        if (!isEmailValid(email)) {
          setEmailError("Enter a valid email address");
          hasError = true;
        }
      }
    }

    // 🔹 Password validation
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
      setLoading(true);

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
            domain: "localhost:1337", // ❗ as required
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Signup failed");
      }

      // ✅ SUCCESS
      console.log("Signup success:", data);
      onNavigate("login"); // move to login screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const slides = Array.from({ length: 5 }); // 5 slides (change count if needed)
  return (
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
                <Image
                  src="/images/tour-logo.svg"
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
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter password</label>
                <input
                  type="password"
                  className={`${styles.input} ${
                    passwordError ? styles.error : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {passwordError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {passwordError}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm password</label>
                <input
                  type="password"
                  className={`${styles.input} ${
                    confirmPasswordError ? styles.error : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {confirmPasswordError && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {confirmPasswordError}
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
                  <span className={styles.checkboxLabel}>
                    Keep me signed in
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className={styles.signupButton}
                disabled={loading}
              >
                {loading ? "SIGNING UP..." : "SIGN UP"}
              </button>
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
}
