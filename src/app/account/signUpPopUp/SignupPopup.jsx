"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./SignupPopup.module.css";

export default function SignupPopup({ onNavigate, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://139.84.175.121:1337/api/frontend-user/register",
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
        }
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.mainContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section */}
        <section className={styles.imageSection}>
          <Image
            src="/images/signup-hero.jpg"
            alt="Scenic mountain view"
            fill
            className={styles.heroImage}
            priority
          />
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
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
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
