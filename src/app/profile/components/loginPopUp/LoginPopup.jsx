"use client";
import Image from "next/image";
import styles from "./LoginPopup.module.css";
import React, { useState, useEffect } from "react";


export default function LoginPopup({ onNavigate, onClose }) {
    useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.mainContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section: Image Area */}
        <section className={styles.imageSection}>
          <Image
            src="/images/travel-hero.jpg"
            alt="Scenic view of Ko Tapu"
            fill
            className={styles.heroImage}
            priority
          />
        </section>

        {/* Right Section: Form Area */}
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
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>
                  New here?{" "}
                  <span
                    className={styles.linkText}
                    onClick={() => onNavigate("signup")}
                  >
                    Create an account
                  </span>
                </p>
              </div>
            </header>

            <form className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Enter Email Id/ Phone Number
                </label>
                <input
                  type="text"
                  placeholder="olivia@untitledui.com"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Enter password</label>
                <input type="password" className={styles.input} />
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkboxContainer}>
                  <input type="checkbox" className={styles.checkboxInput} />
                  <span className={styles.customCheckbox}></span>
                  <span className={styles.checkboxLabel}>Remember me?</span>
                </label>
                <span className={styles.forgotPassword}>Forgot password?</span>
              </div>

              <button type="submit" className={styles.loginButton}>
                LOGIN
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
