"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

import Footer from "../../home-page/components/footer/Footer";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
import VisaDetailSection from "./components/VisaDetailSection";
import styles from "./page.module.css";

const HERO_STATS = [
  { label: "PROCESSING", value: "10-15 days" },
  { label: "STAY", value: "Up to 90 days" },
  { label: "VALIDITY", value: "180 days" },
  { label: "ENTRY", value: "Multiple entry" },
];

const TRUSTED_PARTNERS = [
  "MakeMyTrip",
  "Cleartrip",
  "Yatra",
  "EaseMyTrip",
  "Thomas Cook",
];

const VisaDetailsClient = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");

  const openAuthModal = (view = "login") => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroTopBar}>
          <div className={styles.heroContainer}>
            <img
              className={styles.heroLogo}
              src="/images/footerIcon.png"
              alt="Target Tours"
            />

            <div className={styles.heroActions}>
              <button type="button" className={styles.heroButton}>
                DOWNLOAD THE APP
              </button>
              <button
                type="button"
                className={styles.heroButtonFilled}
                onClick={() => openAuthModal("login")}
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>

        <div className={styles.heroContainer}>
          <div className={styles.heroBody}>
            <div className={styles.countryPill}>
              <span className={styles.countryFlag}>FR</span>
              <span>France - Visa for travellers</span>
            </div>

            <h1 className={styles.heroTitle}>
              Schengen Visa, Handled
              <br /> End-To-End.
            </h1>

            <p className={styles.heroCopy}>
              Documents, appointment, and consulate logistics handled by humans
              who do this every day. You travel - we handle the paperwork.
            </p>

            <div className={styles.heroCtas}>
              <button type="button" className={styles.primaryCta}>
                APPLY WITH EMBASSY-GRADE SUPPORT
              </button>
              <div className={styles.refundNote}>
                <ShieldCheck size={18} />
                <span>Refund if rejected for our error</span>
              </div>
            </div>

            <div className={styles.heroStats}>
              {HERO_STATS.map((item) => (
                <div key={item.label} className={styles.heroStat}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trustStrip}>
        <div className={styles.heroContainer}>
          <span className={styles.trustLabel}>TRUSTED BY - PARTNERED WITH</span>
          <div className={styles.trustPartners}>
            {TRUSTED_PARTNERS.map((partner) => (
              <span key={partner}>{partner}</span>
            ))}
          </div>
        </div>
      </section>

      <VisaDetailSection />

      <Footer />

      {showAuthModal && authView === "login" && (
        <LoginPopup
          onClose={() => setShowAuthModal(false)}
          onNavigate={setAuthView}
        />
      )}

      {showAuthModal && authView === "signup" && (
        <SignupPopup
          onClose={() => setShowAuthModal(false)}
          onNavigate={setAuthView}
        />
      )}
    </main>
  );
};

export default VisaDetailsClient;
