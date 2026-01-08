"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./PersonalData.module.css";

export default function PersonalData() {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("$ U.S. dollar");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "English (US)",
    flag: "/images/us.svg",
  });

  const [isRecommendationsActive, setIsRecommendationsActive] = useState(true);

  const dropdownRef = useRef(null);
  const languageRef = useRef(null);

  const currencies = [
    "$ U.S. dollar",
    "£ Pound sterling",
    "CNY Chinese yuan",
    "SAR Saudi Arabian riyal",
    "RUB Russian ruble",
    "DKK Danish krone",
    "AZN Azerbaijan, New Manats",
    "TWD New Taiwan dollar",
  ];

  const languages = [
    { label: "English (US)", flag: "/images/us.svg" },
    { label: "Deutsch", flag: "/icons/de.svg" },
    { label: "Nederlands", flag: "/icons/bq.svg" },
    { label: "Français", flag: "/icons/mf.svg" },
    { label: "Español", flag: "/icons/es.svg" },
    { label: "Español (AR)", flag: "/icons/ar.svg" },
    { label: "Español (MX)", flag: "/icons/mx.svg" },
    { label: "Italiano", flag: "/icons/it.svg" },
  ];

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
    setIsRecommendationsActive((prev) => !prev);
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
                          className={`${styles.dropdownItem} ${
                            isSelected ? styles.selectedItem : ""
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
                          className={`${styles.dropdownItem} ${
                            isSelected ? styles.selectedItem : ""
                          }`}
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setIsLanguageOpen(false);
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
                className={`${styles.toggle} ${
                  isRecommendationsActive ? styles.toggleActive : ""
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
              <button className={styles.outlineButton}>SET PASSWORD</button>
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
              <button className={styles.deleteButton}>DELETE ACCOUNT</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
